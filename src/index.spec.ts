import { add } from ".";

describe("roman addition", () => {
  test("should add I and I", () => {
    // WHEN
    const actual = add({ I: "I" }, { I: "I" });

    // THEN
    expect(actual).toEqual({ I: "II" });
  });

  test("should add II and I", () => {
    // WHEN
    const actual = add({ I: "II" }, { I: "I" });

    // THEN
    expect(actual).toEqual({ I: "III" });
  });

  test("should add II and III", () => {
    // WHEN
    const actual = add({ I: "II" }, { I: "III" });

    // THEN
    expect(actual).toEqual({ V: "V" });
  });

  test("should add III and III", () => {
    // WHEN
    const actual = add({ I: "III" }, { I: "III" });

    // THEN
    expect(actual).toEqual({ V: "V", I: "I" });
  });

  test("should add V and III", () => {
    // WHEN
    const actual = add({ V: "V" }, { I: "III" });

    // THEN
    expect(actual).toEqual({ V: "V", I: "III" });
  });

  test("should add V and V", () => {
    // WHEN
    const actual = add({ V: "V" }, { V: "V" });

    // THEN
    expect(actual).toEqual({ X: "X" });
  });

  test("should add V and VII", () => {
    // WHEN
    const actual = add({ V: "V" }, { V: "V", I: "II" });

    // THEN
    expect(actual).toEqual({ X: "X", I: "II" });
  });

  test("should add VI and VII", () => {
    // WHEN
    const actual = add({ V: "V", I: "I" }, { V: "V", I: "II" });

    // THEN
    expect(actual).toEqual({ X: "X", I: "III" });
  });

  test("should add VIII and VIII", () => {
    // WHEN
    const actual = add({ V: "V", I: "III" }, { V: "V", I: "III" });

    // THEN
    expect(actual).toEqual({ X: "X", V: "V", I: "I" });
  });

  test("should add VIII and II", () => {
    // WHEN
    const actual = add({ V: "V", I: "III" }, { I: "II" });

    // THEN
    expect(actual).toEqual({ X: "X" });
  });

  test("should add X and XX", () => {
    // WHEN
    const actual = add({ X: "X" }, { X: "XX" });

    // THEN
    expect(actual).toEqual({ X: "XXX" });
  });

  test("should add XX and XXX", () => {
    // WHEN
    const actual = add({ X: "XX" }, { X: "XXX" });

    // THEN
    expect(actual).toEqual({ L: "L" });
  });

  test("should add LX and XXX", () => {
    // WHEN
    const actual = add({ X: "X", L: "L" }, { X: "XXX" });

    // THEN
    expect(actual).toEqual({ L: "L", X: "XXXX" });
  });

  test("should add L and L", () => {
    // WHEN
    const actual = add({ L: "L" }, { L: "L" });

    // THEN
    expect(actual).toEqual({ C: "C" });
  });
});
