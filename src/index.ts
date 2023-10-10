type WeakDigit = "I" | "X" | "C" | "M";

type StrongDigit = "V" | "L" | "D";

type OneTwoThreeOrFour<W extends WeakDigit> = `${W}` | `${W}${W}` | `${W}${W}${W}` | `${W}${W}${W}${W}`;
type OnlyOne<S extends StrongDigit> = `${S}`;

type WeakOnly<W extends WeakDigit> = { weaks: OneTwoThreeOrFour<W> };
type StrongOnly<S extends StrongDigit> = { strong: S };
type StrongAndWeak<W extends WeakDigit, S extends StrongDigit> = { weaks: OneTwoThreeOrFour<W>; strong: S };

type WeakAdditionResult<W extends WeakDigit, S extends StrongDigit> = WeakOnly<W> | StrongOnly<S> | StrongAndWeak<W, S>;

type WeakToStrongTransition = {
  weak: WeakDigit;
  nextStrong: StrongDigit;
  direction: "weakToStrong";
};
type StrongToWeakTransition = {
  strong: StrongDigit;
  nextWeak: WeakDigit;
  direction: "strongToWeak";
};

const bothAreDefined = <T extends string>(a: T | undefined, b: T | undefined) => a && b;
const onlyOneIsDefined = <T extends string>(a: T | undefined, b: T | undefined) => (a && !b) || (b && !a);

type Transition = WeakToStrongTransition | StrongToWeakTransition;

const transitions: Array<Transition> = [
  {
    weak: "I",
    nextStrong: "V",
    direction: "weakToStrong",
  },
  {
    nextWeak: "X",
    strong: "V",
    direction: "strongToWeak",
  },
  {
    weak: "X",
    nextStrong: "L",
    direction: "weakToStrong",
  },
  {
    nextWeak: "C",
    strong: "L",
    direction: "strongToWeak",
  },
  {
    weak: "C",
    nextStrong: "D",
    direction: "weakToStrong",
  },
];

const weakAdditionTable = <W extends WeakDigit, S extends StrongDigit>(
  w: W,
  s: S
): Partial<Record<OneTwoThreeOrFour<W>, Partial<Record<OneTwoThreeOrFour<W>, WeakAdditionResult<W, S>>>>> => {
  // @ts-expect-error
  return {
    [`${w}`]: {
      [`${w}`]: { weaks: `${w}${w}` },
      [`${w}${w}`]: { weaks: `${w}${w}${w}` },
      [`${w}${w}${w}`]: { weaks: `${w}${w}${w}${w}` },
      [`${w}${w}${w}${w}`]: { strong: s },
    },
    [`${w}${w}`]: {
      [`${w}`]: { weaks: `${w}${w}${w}` },
      [`${w}${w}`]: { weaks: `${w}${w}${w}${w}` },
      [`${w}${w}${w}`]: { strong: s },
      [`${w}${w}${w}${w}`]: { strong: s, weaks: `${w}` },
    },
    [`${w}${w}${w}`]: {
      [`${w}`]: { weaks: `${w}${w}${w}${w}` },
      [`${w}${w}`]: { strong: s },
      [`${w}${w}${w}`]: { strong: s, weaks: `${w}` },
      [`${w}${w}${w}${w}`]: { strong: s, weaks: `${w}${w}` },
    },
    [`${w}${w}${w}${w}`]: {
      [`${w}`]: { strong: s },
      [`${w}${w}`]: { strong: s, weaks: `${w}` },
      [`${w}${w}${w}`]: { strong: s, weaks: `${w}${w}` },
      [`${w}${w}${w}${w}`]: { strong: s, weaks: `${w}${w}${w}` },
    },
  };
};

type StrongAdditionResult<S extends StrongDigit, W extends WeakDigit> = WeakOnly<W>;

const strongAdditionTable = <S extends StrongDigit, W extends WeakDigit>(
  s: S,
  w: W
): Partial<Record<OnlyOne<S>, Partial<Record<OnlyOne<S>, StrongAdditionResult<S, W>>>>> => {
  // @ts-expect-error
  return {
    [`${s}`]: {
      [`${s}`]: { weaks: `${w}` },
    },
  };
};

type StructuredRomanNumber = {
  [W in WeakDigit]?: OneTwoThreeOrFour<W>;
} & {
  [S in StrongDigit]?: OnlyOne<S>;
};

const buildRomanNumberOfGreatestWeakDigit =
  (transition: StrongToWeakTransition) =>
  (a: StructuredRomanNumber, b: StructuredRomanNumber): StructuredRomanNumber => {
    const nextWeak = transition.nextWeak;
    const strong = transition.strong;

    const strongTable = strongAdditionTable(strong, nextWeak);
    const additionResult = strongTable[a[strong]][b[strong]];

    return {
      [nextWeak]: `${additionResult.weaks}`,
      [strong]: undefined,
    };
  };

const buildRomanNumberOfSameStrongDigit =
  (transition: StrongToWeakTransition) =>
  (a: StructuredRomanNumber, b: StructuredRomanNumber): StructuredRomanNumber => {
    const strong = transition.strong;
    const definedStrong = a[strong] ?? b[strong];
    return {
      [strong]: definedStrong,
    };
  };

const addStrongs =
  (transition: StrongToWeakTransition) =>
  (a: StructuredRomanNumber, b: StructuredRomanNumber): StructuredRomanNumber => {
    const strong = transition.strong;
    if (bothAreDefined(a[strong], b[strong])) {
      return buildRomanNumberOfGreatestWeakDigit(transition)(a, b);
    }

    if (onlyOneIsDefined(a[strong], b[strong])) {
      return buildRomanNumberOfSameStrongDigit(transition)(a, b);
    }

    return {};
  };

const addWeaks = (transition: WeakToStrongTransition) => (a: StructuredRomanNumber, b: StructuredRomanNumber) => {
  const weak = transition.weak;
  const nextStrong = transition.nextStrong;

  if (bothAreDefined(a[weak], b[weak])) {
    const weakTable = weakAdditionTable(weak, nextStrong);
    const additionResult = weakTable[a[weak]][b[weak]];

    const noDeduction = !("strong" in additionResult);
    if (noDeduction) {
      return { result: { [weak]: additionResult.weaks }, deduction: {} };
    }

    const noRemainder = !("weaks" in additionResult);
    if (noRemainder) {
      return { deduction: { [nextStrong]: additionResult.strong }, result: {} };
    }

    if ("weaks" in additionResult && "strong" in additionResult) {
      return { result: { [weak]: additionResult.weaks }, deduction: { [nextStrong]: additionResult.strong } };
    }
  }

  if (onlyOneIsDefined(a[weak], b[weak])) {
    return { result: { [weak]: a[weak] ?? b[weak] }, deduction: {} };
  }

  // 0 + 0
  return { result: {}, deduction: {} };
};

export const add = (a: StructuredRomanNumber, b: StructuredRomanNumber): StructuredRomanNumber => {
  let initialResult: StructuredRomanNumber = {};
  let initialDeduction: StructuredRomanNumber = {};

  const finalResult = transitions.reduce(
    (accumulator, transition) => {
      let resultForThisIterration: StructuredRomanNumber = {};
      let deductionForThisIterration: StructuredRomanNumber = {};
      if (transition.direction === "weakToStrong") {
        const { result, deduction } = addWeaks(transition)(a, b);
        const resultForThisIterrationWithoutDeduction = {
          ...accumulator.result,
          ...result,
        };

        resultForThisIterration = {
          ...resultForThisIterrationWithoutDeduction,
          ...addWeaks(transition)(resultForThisIterrationWithoutDeduction, accumulator.deduction).result,
        };

        deductionForThisIterration = deduction;
      }

      if (transition.direction === "strongToWeak") {
        const strong = transition.strong;
        const resultForThisIterrationWithoutDeduction = {
          ...accumulator.result,
          ...addStrongs(transition)(a, b),
        };

        resultForThisIterration = {
          ...resultForThisIterrationWithoutDeduction,
          ...addStrongs(transition)(
            { [strong]: resultForThisIterrationWithoutDeduction[strong] },
            accumulator.deduction
          ),
        };
      }

      return {
        result: resultForThisIterration,
        deduction: deductionForThisIterration,
      };
    },
    {
      result: initialResult,
      deduction: initialDeduction,
    }
  );

  return finalResult.result;
};
