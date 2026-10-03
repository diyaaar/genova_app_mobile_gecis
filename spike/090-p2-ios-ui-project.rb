require 'xcodeproj'
root = File.expand_path('..', __dir__)
path = root + '/apps/mobile/ios/Genova.xcodeproj'
project = Xcodeproj::Project.open(path)
app = project.targets.find { |target| target.name == 'Genova' } or abort 'Missing frozen app target'
target = project.targets.find { |item| item.name == 'P2UITests' }
if target
  abort 'Unexpected UI target sources' unless target.source_build_phase.files_references.map(&:real_path).map(&:to_s) == [root + '/spike/090-p2-ios-ui.swift']
else
  target = project.new_target(:ui_test_bundle, 'P2UITests', :ios, '16.0')
  target.add_dependency(app)
  source = project.main_group.new_file(root + '/spike/090-p2-ios-ui.swift')
  target.source_build_phase.add_file_reference(source)
end
target.build_configurations.each do |config|
  config.build_settings.merge!({'PRODUCT_BUNDLE_IDENTIFIER'=>'com.genesinovachoir.genova.p2uitests',
    'PRODUCT_NAME'=>'$(TARGET_NAME)', 'GENERATE_INFOPLIST_FILE'=>'YES', 'SWIFT_VERSION'=>'5.0', 'TEST_TARGET_NAME'=>'Genova',
    'CODE_SIGN_IDENTITY'=>'-', 'CODE_SIGNING_ALLOWED'=>'YES', 'SUPPORTED_PLATFORMS'=>'iphonesimulator',
    'TARGETED_DEVICE_FAMILY'=>'1,2'})
end
project.save
scheme = Xcodeproj::XCScheme.new
scheme.add_build_target(app); scheme.add_build_target(target, false)
scheme.add_test_target(target); scheme.set_launch_target(app)
scheme.test_action.build_configuration = 'Release'
scheme.save_as(path, 'P2UITests', true)
puts 'Generated one owned P2 UI target using the installed CocoaPods xcodeproj library'
