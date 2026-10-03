import XCTest

// Agent-owned synthetic P2 UI only. No recipient/account/print interaction.
final class P2UITests: XCTestCase {
  let app = XCUIApplication(bundleIdentifier: "com.genesinovachoir.genova")
  func shot(_ name: String) {
    let evidence = XCTAttachment(screenshot: app.screenshot())
    evidence.name = name; evidence.lifetime = .keepAlways; add(evidence)
  }
  func request(_ path: String, body: String? = nil) throws -> [String: Any] {
    let done = expectation(description: path)
    var result: Data?; var problem: Error?; var status = 0
    var request = URLRequest(url: URL(string: "http://127.0.0.1:18092" + path)!)
    if let body { request.httpMethod = "POST"; request.httpBody = body.data(using: .utf8); request.setValue("application/json", forHTTPHeaderField: "Content-Type") }
    URLSession.shared.dataTask(with: request) { data, response, error in
      result = data; problem = error; status = (response as? HTTPURLResponse)?.statusCode ?? 0; done.fulfill()
    }.resume()
    wait(for: [done], timeout: 10)
    if let problem { throw problem }
    XCTAssertEqual(status, 200)
    return try JSONSerialization.jsonObject(with: XCTUnwrap(result)) as! [String: Any]
  }
  func tap(_ identifier: String) {
    let item = app.descendants(matching: .any).matching(identifier: identifier).firstMatch
    XCTAssertTrue(item.waitForExistence(timeout: 25), "Missing " + identifier)
    XCTAssertTrue(item.isHittable, "Not hittable " + identifier); item.tap()
  }
  func testInteractive() throws {
    continueAfterFailure = false; app.activate()
    XCTAssertTrue(app.buttons["Koro B"].waitForExistence(timeout: 25))
    shot("profile-before-scroll")
    let web = app.webViews.firstMatch
    // WebKit may expose no web element tree through the Simulator AX bridge.
    // XCTest gestures use the actual visible content area, never JS injection.
    for _ in 0..<3 {
      app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.85)).press(forDuration: 0.1, thenDragTo: app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.30)))
      if app.links["Drive Linki"].isHittable { break }
    }
    shot("homework-after-scroll")
    let link = app.links["Drive Linki"].firstMatch
    XCTAssertTrue(link.waitForExistence(timeout: 15), "Web links: " + web.debugDescription)
    XCTAssertTrue(link.isHittable); link.tap()
    tap("Vazgeç")
    XCTAssertFalse(app.staticTexts["Dosyayı aç"].exists)
    let cancelled = try request("/090/read-observation")
    XCTAssertEqual(cancelled["fileGets"] as? Int, 0); XCTAssertEqual(cancelled["fileHeads"] as? Int, 0)
    _ = try request("/090/ui-event", body: "{\"event\":\"cancel-observed\"}")
    shot("consent-cancelled")
    link.tap(); tap("Devam et")
    XCTAssertTrue(app.images["protected-pdf-page"].waitForExistence(timeout: 25))
    XCTAssertEqual(app.staticTexts["protected-pdf-counter"].label, "1 / 40")
    shot("pdf-page-1")
    tap("protected-pdf-next")
    let pageTwo = app.images["protected-pdf-page"]
    XCTAssertTrue(pageTwo.waitForExistence(timeout: 20))
    let rendered = NSPredicate(format: "label == %@", "2. PDF sayfası")
    expectation(for: rendered, evaluatedWith: pageTwo); waitForExpectations(timeout: 20)
    XCTAssertEqual(app.staticTexts["protected-pdf-counter"].label, "2 / 40")
    shot("pdf-page-2")
    tap("protected-pdf-share")
    let close = app.otherElements["PopoverDismissRegion"].firstMatch
    XCTAssertTrue(close.waitForExistence(timeout: 20), "Share sheet: " + app.debugDescription)
    shot("actual-ios-share-sheet"); close.tap()
    XCTAssertTrue(app.buttons["protected-pdf-close"].waitForExistence(timeout: 15))
    shot("share-returned-to-pdf"); tap("protected-pdf-close")
    XCTAssertTrue(app.buttons["Koro B"].waitForExistence(timeout: 20))
    XCTAssertFalse(app.otherElements["protected-pdf-preview"].exists)
    shot("preview-closed-active-choir-A")
    tap("Koro B")
    let passed = app.staticTexts.containing(NSPredicate(format: "label CONTAINS %@", "Interactive B refusal/clear PASS")).firstMatch
    XCTAssertTrue(passed.waitForExistence(timeout: 25), "Completion: " + app.debugDescription)
    shot("choir-B-denial-complete")
  }
}
