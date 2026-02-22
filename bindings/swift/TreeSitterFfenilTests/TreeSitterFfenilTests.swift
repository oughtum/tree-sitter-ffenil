import XCTest
import SwiftTreeSitter
import TreeSitterFfenil

final class TreeSitterFfenilTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_ffenil())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Ffenil grammar")
    }
}
