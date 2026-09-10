import XCTest
@testable import Hinge
final class HingeTests: XCTestCase {
    func testOpenLidHasNoEffect() { XCTAssertEqual(EffectValues.values(for: 120, style: .silk), EffectValues(perspective: 1, blur: 0, shade: 0)) }
    func testFrostAddsBlurAsLidCloses() { XCTAssertGreaterThan(EffectValues.values(for: 40, style: .frost).blur, 10) }
}
