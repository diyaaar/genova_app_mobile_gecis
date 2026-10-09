// Supported offline-only reconstruction. Never mutate the protected original,
// update catalogs, remove comparison fields or infer roots from expanded children.
const plain=name=>{if(!/^[a-z_][a-z_0-9]*$/.test(name))throw Error('Unsupported seed identifier');return name;};
const quote=name=>'"'+plain(name)+'"';
const qualified=(schema,name)=>quote(schema)+'.'+quote(name);

// Visit syntax characters only, excluding quoted strings/identifiers, nested
// comments and dollar bodies. Standard strings do NOT treat backslash as escape.
function scan(sql,start,visit){
  for(let i=start;i<sql.length;i++){
    const c=sql[i],tail=sql.slice(i);let m;
    if(c==="'"||c==='"'){
      const e=c==="'"&&/[eE]/.test(sql[i-1]||'')&&!/[a-zA-Z0-9_]/.test(sql[i-2]||'');let closed=false;
      for(i++;i<sql.length;i++){
        if(e&&sql[i]==='\\'){i++;continue;}
        if(sql[i]===c){if(sql[i+1]===c){i++;continue;}closed=true;break;}
      }
      if(!closed)throw Error('Unclosed seed quote');continue;
    }
    if(tail.startsWith('--')){const end=sql.indexOf('\n',i);if(end<0)return;i=end;continue;}
    if(tail.startsWith('/*')){
      let depth=1;i+=2;for(;i<sql.length&&depth;i++){if(sql.startsWith('/*',i)){depth++;i++;}else if(sql.startsWith('*/',i)){depth--;i++;}}
      if(depth)throw Error('Unclosed seed comment');i--;continue;
    }
    if((m=tail.match(/^\$(?:[A-Za-z_][A-Za-z_0-9]*)?\$/))){const end=sql.indexOf(m[0],i+m[0].length);if(end<0)throw Error('Unclosed seed dollar body');i=end+m[0].length-1;continue;}
    if(visit(c,i)===false)return i;
  }
}
export function tableBoundary(sql,open){
  if(sql[open]!=='(')throw Error('Missing table column boundary');let depth=0,close;
  scan(sql,open,(c,i)=>{if(c==='(')depth++;if(c===')'&&--depth===0){close=i;return false;}});
  if(close===undefined)throw Error('Unclosed table column boundary');
  let suffixDepth=0;
  const end=scan(sql,close+1,(c)=>{if(c==='(')suffixDepth++;if(c===')')suffixDepth--;if(suffixDepth<0)throw Error('Invalid table suffix');if(c===';'&&suffixDepth===0)return false;});
  if(end===undefined)throw Error('Unclosed table statement');return {close,end};
}
export function splitColumns(body){
  const parts=[];let depth=0,start=0;
  scan(body,0,(c,i)=>{if(c==='(')depth++;if(c===')')depth--;if(depth<0)throw Error('Unbalanced column expression');if(c===','&&depth===0){parts.push(body.slice(start,i).trim());start=i+1;}});
  if(depth)throw Error('Unbalanced column expression');parts.push(body.slice(start).trim());
  if(parts.some(p=>!p))throw Error('Empty column declaration');return parts;
}
export function restoreDroppedSlots(sql,catalog){
  const groups=new Map();
  for(const r of catalog.droppedColumns){plain(r.schema);plain(r.table_name);if(!Number.isInteger(r.position)||r.position<1||r.position>1600)throw Error('Dropped position refused');const id=r.schema+'.'+r.table_name;groups.set(id,[...(groups.get(id)||[]),r]);}
  let out=sql,slots=0;
  for(const [id,dropped] of groups){
    const [schema,name]=id.split('.'),relation=catalog.relations.find(r=>r.schema===schema&&r.name===name);
    if(!relation||!['r','p'].includes(relation.kind))throw Error('Dropped relation kind refused');
    const columns=catalog.columns.filter(c=>c.table_schema===schema&&c.table_name===name).sort((a,b)=>a.ordinal_position-b.ordinal_position);
    if(!columns.length)throw Error('Missing surviving columns');
    const prefix=`CREATE TABLE ${schema}.${name} (`;
    const matches=[...out.matchAll(new RegExp('^'+prefix.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gm'))];
    if(matches.length!==1)throw Error('Ambiguous source table declaration');
    const start=matches[0].index,open=start+prefix.length-1,{close,end}=tableBoundary(out,open),parts=splitColumns(out.slice(open+1,close));
    const columnParts=parts.slice(0,columns.length),constraints=parts.slice(columns.length);
    // pg_dump quotes retained names with spaces; preserve that declaration byte-exact.
    if(constraints.some(c=>!/^CONSTRAINT (?:[a-z_][a-z_0-9]*|"(?:[^"]|"")+")\s/.test(c)))throw Error('Unsupported trailing table declaration');
    for(let i=0;i<columns.length;i++){
      const c=columns[i];plain(c.column_name);
      if(!columnParts[i]?.startsWith(c.column_name+' '))throw Error('Dump/catalog column order mismatch');
      if(!Number.isInteger(c.ordinal_position)||c.ordinal_position<1||c.ordinal_position>1600)throw Error('Column ordinal refused');
    }
    const wanted=new Map(columns.map((c,i)=>[c.ordinal_position,columnParts[i]])),drops=new Set(dropped.map(r=>r.position));
    if(wanted.size!==columns.length||drops.size!==dropped.length||[...drops].some(p=>wanted.has(p)))throw Error('Duplicate/overlapping source slots');
    const max=Math.max(...wanted.keys(),...drops),rebuilt=[],dropSql=[];
    for(let position=1;position<=max;position++){
      if(wanted.has(position)){rebuilt.push(wanted.get(position));continue;}
      if(!drops.has(position))throw Error('Uncaptured source position gap');
      const placeholder='__g090_recovery_drop_'+position;
      if(columns.some(c=>c.column_name===placeholder))throw Error('Placeholder collision');
      rebuilt.push(quote(placeholder)+' text');dropSql.push(`ALTER TABLE ${qualified(schema,name)} DROP COLUMN ${quote(placeholder)};`);slots++;
    }
    const replacement=out.slice(start,open+1)+'\n    '+[...rebuilt,...constraints].join(',\n    ')+'\n'+out.slice(close,end+1)+'\n'+dropSql.join('\n');
    out=out.slice(0,start)+replacement+out.slice(end+1);
  }
  return {sql:out,tables:groups.size,slots};
}

// Exact known source BETWEEN form (053), not a semantic comparator. Reconstitute
// its nested Boolean tree using supported SQL, leaving the full exact gate intact.
export function restoreBetweenForm(sql,catalog){
  const pair='((length(object_key) >= 1) AND (length(object_key) <= 1024))',replacement='(length(object_key) BETWEEN 1 AND 1024)';let out=sql,count=0;
  for(const c of catalog.constraints){
    if(c.type!=='c'||!c.definition.includes(pair))continue;
    if(c.definition.split(pair).length!==2)throw Error('Ambiguous BETWEEN source pair');
    const needle=`CONSTRAINT ${plain(c.name)} ${c.definition}`;
    if(out.split(needle).length!==2)throw Error('Ambiguous BETWEEN dump declaration');
    // Callback is essential: SQL regex literals contain $'/$&/$` sequences, which
    // String.replace otherwise expands as prefix/suffix/match substitutions.
    out=out.replace(needle,()=>`CONSTRAINT ${plain(c.name)} ${c.definition.replace(pair,replacement)}`);count++;
  }
  if(out.length!==sql.length+count*(replacement.length-pair.length))throw Error('Unexpected BETWEEN rewrite growth');
  return {sql:out,count};
}
export function publicationSeed(catalog){
  if(catalog.publicationSchemas.length)throw Error('Schema publication requires explicit supported reconstruction');
  const rows=[],names=new Set();
  for(const p of catalog.publications){
    if(names.has(p.name)||p.all_tables!==false)throw Error('Publication scope refused');names.add(p.name);
    for(const field of ['pubinsert','pubupdate','pubdelete','pubtruncate','pubviaroot'])if(typeof p[field]!=='boolean')throw Error('Publication flag refused');
    const publish=['insert','update','delete','truncate'].filter(key=>p['pub'+key]);
    rows.push(`CREATE PUBLICATION ${quote(p.name)} WITH (publish='${publish.join(',')}', publish_via_partition_root=${p.pubviaroot});`);
    const roots=catalog.publicationRelations.filter(r=>r.publication===p.name),seen=new Set();
    for(const r of roots){
      const id=r.schema+'.'+r.table_name;if(seen.has(id)||r.columns!==null||r.row_filter!==null)throw Error('Publication filter/column/duplicate requires separate support');seen.add(id);
      if(!catalog.relations.some(c=>c.schema===r.schema&&c.name===r.table_name&&['r','p'].includes(c.kind)))throw Error('Uncaptured publication root');
      // ONLY prevents accidentally adding ordinary inheritance descendants.
      // Partition children remain automatically covered by PG semantics.
      rows.push(`ALTER PUBLICATION ${quote(p.name)} ADD TABLE ONLY ${qualified(r.schema,r.table_name)};`);
    }
    rows.push(`ALTER PUBLICATION ${quote(p.name)} OWNER TO ${quote(p.owner)};`);
  }
  if(catalog.publicationRelations.some(r=>!names.has(r.publication)))throw Error('Unknown publication root owner');
  return {sql:rows.join('\n'),publications:names.size,roots:catalog.publicationRelations.length};
}
