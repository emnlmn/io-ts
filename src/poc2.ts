import * as E from 'fp-ts/lib/Either'
import { Lazy, Refinement } from 'fp-ts/lib/function'
import { HKT, Kind, Kind2, URIS, URIS2 } from 'fp-ts/lib/HKT'
import { pipe } from 'fp-ts/lib/pipeable'
import * as RNEA from 'fp-ts/lib/ReadonlyNonEmptyArray'

import Either = E.Either
import ReadonlyNonEmptyArray = RNEA.ReadonlyNonEmptyArray

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

export interface Decoder<I, E, A> {
  readonly decode: (i: I) => Either<E, A>
}

interface AnyD extends Decoder<any, any, any> {}
interface AnyUD extends Decoder<unknown, any, any> {}

export type InputOf<D> = D extends Decoder<infer I, any, any> ? I : never
export type ErrorOf<D> = D extends Decoder<any, infer E, any> ? E : never
export type TypeOf<D> = D extends Decoder<any, any, infer A> ? A : never

// -------------------------------------------------------------------------------------
// error model
// -------------------------------------------------------------------------------------

export interface LeafE<E> {
  readonly _tag: 'LeafE'
  readonly error: E
}
export declare const leafE: <E>(e: E) => LeafE<E>

export interface NullableE<E> {
  readonly _tag: 'NullableE'
  readonly error: E
}

export interface KeyE<E> {
  readonly key: string
  readonly error: E
}

export interface StructE<E> {
  readonly _tag: 'StructE'
  readonly error: ReadonlyNonEmptyArray<KeyE<E>>
}

export interface PartialE<E> {
  readonly _tag: 'PartialE'
  readonly error: ReadonlyNonEmptyArray<KeyE<E>>
}

export interface IndexE<E> {
  readonly index: number
  readonly error: E
}

export interface TupleE<E> {
  readonly _tag: 'TupleE'
  readonly error: ReadonlyNonEmptyArray<IndexE<E>>
}

export interface ArrayE<E> extends ActualE<ReadonlyArray<unknown>> {
  readonly _tag: 'ArrayE'
  readonly error: ReadonlyNonEmptyArray<IndexE<E>>
}

export interface RecordE<E> extends ActualE<Readonly<Record<string, unknown>>> {
  readonly _tag: 'RecordE'
  readonly error: ReadonlyNonEmptyArray<KeyE<E>>
}

export interface UnionE<E> {
  readonly _tag: 'UnionE'
  readonly error: ReadonlyNonEmptyArray<IndexE<E>>
}

export interface RefineE<E> {
  readonly _tag: 'RefineE'
  readonly error: E
}

export interface ParseE<E> {
  readonly _tag: 'ParseE'
  readonly error: E
}

export interface IntersectE<E> {
  readonly _tag: 'IntersectE'
  readonly error: E
}

export interface LazyE<E> {
  readonly _tag: 'LazyE'
  readonly id: string
  readonly error: E
}

export interface SumE<E> {
  readonly _tag: 'SumE'
  readonly error: ReadonlyNonEmptyArray<IndexE<E>>
}

export interface NullableRE<E> extends NullableE<DecodeError<E>> {}
export interface RefineRE<E> extends RefineE<DecodeError<E>> {}
export interface ParseRE<E> extends ParseE<DecodeError<E>> {}
export interface StructRE<E> extends StructE<DecodeError<E>> {}
export interface PartialRE<E> extends PartialE<DecodeError<E>> {}
export interface TupleRE<E> extends TupleE<DecodeError<E>> {}
export interface ArrayRE<E> extends ArrayE<DecodeError<E>> {}
export interface RecordRE<E> extends RecordE<DecodeError<E>> {}
export interface UnionRE<E> extends UnionE<DecodeError<E>> {}
export interface IntersectionRE<E> extends IntersectE<DecodeError<E>> {}
export interface SumRE<E> extends SumE<DecodeError<E>> {}
export interface LazyRE<E> extends LazyE<DecodeError<E>> {}
export type DecodeError<E> =
  | LeafE<E>
  | NullableRE<E>
  | RefineRE<E>
  | ParseRE<E>
  | StructRE<E>
  | PartialRE<E>
  | TupleRE<E>
  | ArrayRE<E>
  | RecordRE<E>
  | UnionRE<E>
  | IntersectionRE<E>
  | SumRE<E>
  | LazyRE<E>

// -------------------------------------------------------------------------------------
// error utils
// -------------------------------------------------------------------------------------
export interface ActualE<I> {
  readonly actual: I
}

export type DefaultLeafE =
  | StringE
  | NumberE
  | BooleanE
  | UnknownRecordE
  | UnknownArrayE
  | LiteralE<ReadonlyNonEmptyArray<Literal>>
  | TagE<PropertyKey>

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

export interface StringE extends ActualE<unknown> {
  readonly _tag: 'StringE'
}
export interface stringD extends Decoder<unknown, LeafE<StringE>, string> {
  readonly _tag: 'stringD'
}
export declare const string: stringD

export interface NumberE extends ActualE<unknown> {
  readonly _tag: 'NumberE'
}
export interface numberD extends Decoder<unknown, LeafE<NumberE>, number> {
  readonly _tag: 'numberD'
}
export declare const number: numberD

export interface BooleanE extends ActualE<unknown> {
  readonly _tag: 'BooleanE'
}
export interface booleanD extends Decoder<unknown, LeafE<BooleanE>, boolean> {
  readonly _tag: 'booleanD'
}
export declare const boolean: booleanD

// -------------------------------------------------------------------------------------
// unknown containers
// -------------------------------------------------------------------------------------

export interface UnknownArrayE extends ActualE<unknown> {
  readonly _tag: 'UnknownArrayE'
}
export interface UnknownArrayD extends Decoder<unknown, LeafE<UnknownArrayE>, Array<unknown>> {
  readonly _tag: 'UnknownArrayD'
}
export declare const UnknownArray: UnknownArrayD

export interface UnknownRecordE extends ActualE<unknown> {
  readonly _tag: 'UnknownRecordE'
}
export interface UnknownRecordD extends Decoder<unknown, LeafE<UnknownRecordE>, Record<string, unknown>> {
  readonly _tag: 'UnknownRecordD'
}
export declare const UnknownRecord: UnknownRecordD

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

export type Literal = string | number | boolean | null

export interface LiteralE<A extends ReadonlyNonEmptyArray<Literal>> {
  readonly _tag: 'LiteralE'
  readonly literals: A
}

export interface LiteralD<A extends ReadonlyNonEmptyArray<Literal>>
  extends Decoder<unknown, LeafE<LiteralE<A>>, A[number]> {
  readonly _tag: 'LiteralD'
  readonly literals: A
}

export declare const literal: <A extends ReadonlyNonEmptyArray<Literal>>(...values: A) => LiteralD<A>

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

export interface FromStructD<Properties>
  extends Decoder<
    { [K in keyof Properties]: InputOf<Properties[K]> },
    StructE<ErrorOf<Properties[keyof Properties]>>,
    { [K in keyof Properties]: TypeOf<Properties[K]> }
  > {
  readonly _tag: 'FromStructD'
  readonly properties: Properties
}
export declare const fromStruct: <Properties extends Record<string, AnyD>>(
  properties: Properties
) => FromStructD<Properties>

export interface FromPartialD<Properties>
  extends Decoder<
    Partial<{ [K in keyof Properties]: InputOf<Properties[K]> }>,
    PartialE<ErrorOf<Properties[keyof Properties]>>,
    Partial<{ [K in keyof Properties]: TypeOf<Properties[K]> }>
  > {
  readonly _tag: 'FromPartialD'
  readonly properties: Properties
}
export declare const fromPartial: <Properties extends Record<string, AnyD>>(
  properties: Properties
) => FromPartialD<Properties>

export interface FromArrayD<Item> extends Decoder<Array<InputOf<Item>>, ArrayE<ErrorOf<Item>>, Array<TypeOf<Item>>> {
  readonly _tag: 'FromArrayD'
  readonly item: Item
}
export declare const fromArray: <Item extends AnyD>(item: Item) => FromArrayD<Item>

export interface FromRecordD<Codomain>
  extends Decoder<Record<string, InputOf<Codomain>>, RecordE<ErrorOf<Codomain>>, Record<string, TypeOf<Codomain>>> {
  readonly _tag: 'FromRecordD'
  readonly codomain: Codomain
}
export declare const fromRecord: <Codomain extends AnyD>(codomain: Codomain) => FromRecordD<Codomain>

export interface FromTupleD<Components>
  extends Decoder<
    { [K in keyof Components]: InputOf<Components[K]> },
    TupleE<ErrorOf<Components[keyof Components]>>,
    { [K in keyof Components]: TypeOf<Components[K]> }
  > {
  readonly _tag: 'FromTupleD'
  readonly components: Components
}
export declare const fromTuple: <Components extends ReadonlyArray<AnyD>>(
  ...components: Components
) => FromTupleD<Components>

export interface UnionD<Members>
  extends Decoder<
    InputOf<Members[keyof Members]>,
    UnionE<ErrorOf<Members[keyof Members]>>,
    TypeOf<Members[keyof Members]>
  > {
  readonly _tag: 'UnionD'
  readonly members: Members
}
export declare const union: <Members extends ReadonlyArray<AnyD>>(...members: Members) => UnionD<Members>

export interface NullableD<Or> extends Decoder<null | InputOf<Or>, NullableE<ErrorOf<Or>>, null | TypeOf<Or>> {
  readonly _tag: 'NullableD'
  readonly or: Or
}
export declare const nullable: <Or extends AnyD>(or: Or) => NullableD<Or>

export interface RefineD<From, E, B extends TypeOf<From>>
  extends Decoder<InputOf<From>, ErrorOf<From> | RefineE<E>, B> {
  readonly _tag: 'RefineD'
  readonly from: From
  readonly refinement: Refinement<TypeOf<From>, B>
  readonly error: (from: TypeOf<From>) => E
}
export declare const refine: <From extends AnyD, B extends TypeOf<From>, E>(
  refinement: Refinement<TypeOf<From>, B>,
  error: (from: TypeOf<From>) => E
) => (from: From) => RefineD<From, E, B>

export interface ParseD<From, E, B> extends Decoder<InputOf<From>, ErrorOf<From> | ParseE<E>, B> {
  readonly _tag: 'ParseD'
  readonly from: From
  readonly parser: (a: TypeOf<From>) => E.Either<E, B>
}
export declare const parse: <From extends AnyD, B, E>(
  parser: (a: TypeOf<From>) => E.Either<E, B>
) => (from: From) => ParseD<From, E, B>

export interface IntersectD<F, S>
  extends Decoder<InputOf<F> & InputOf<S>, IntersectE<ErrorOf<F> | ErrorOf<S>>, TypeOf<F> & TypeOf<S>> {
  readonly _tag: 'IntersectD'
  readonly first: F
  readonly second: S
}
export declare const intersect: <S extends AnyD>(second: S) => <F extends AnyD>(first: F) => IntersectD<F, S>

export interface LazyD<D> {
  readonly _tag: 'LazyD'
  readonly id: string
  readonly decoder: Lazy<D>
}
export declare const lazy: <I, E, A>(id: string, decoder: Lazy<Decoder<I, E, A>>) => Decoder<I, LazyE<E>, A>

export interface TagE<A extends PropertyKey> {
  readonly _tag: 'TagE'
  readonly tags: ReadonlyNonEmptyArray<A>
}

export interface FromSumD<T extends string, Members>
  extends Decoder<
    InputOf<Members[keyof Members]>,
    LeafE<TagE<keyof Members>> | SumE<ErrorOf<Members[keyof Members]>>,
    TypeOf<Members[keyof Members]>
  > {
  readonly _tag: 'FromSumD'
  readonly tag: T
  readonly members: Members
}
// TODO: every `Members` should own a tag field
export declare const fromSum: <T extends string>(
  tag: T
) => <Members extends Record<string, AnyD>>(members: Members) => FromSumD<T, Members>

export interface StructD<Properties>
  extends Decoder<
    unknown,
    LeafE<UnknownRecordE> | StructE<ErrorOf<Properties[keyof Properties]>>,
    { [K in keyof Properties]: TypeOf<Properties[K]> }
  > {
  readonly _tag: 'StructD'
  readonly properties: Properties
}
export declare const struct: <Properties extends Record<string, AnyUD>>(properties: Properties) => StructD<Properties>

export interface PartialD<Properties>
  extends Decoder<
    unknown,
    LeafE<UnknownRecordE> | PartialE<ErrorOf<Properties[keyof Properties]>>,
    Partial<{ [K in keyof Properties]: TypeOf<Properties[K]> }>
  > {
  readonly _tag: 'PartialD'
  readonly properties: Properties
}
export declare const partial: <Properties extends Record<string, AnyUD>>(properties: Properties) => PartialD<Properties>

export interface TupleD<Components>
  extends Decoder<
    unknown,
    LeafE<UnknownArrayE> | TupleE<ErrorOf<Components[keyof Components]>>,
    { [K in keyof Components]: TypeOf<Components[K]> }
  > {
  readonly _tag: 'TupleD'
  readonly components: Components
}

export declare const tuple: <Components extends ReadonlyArray<AnyUD>>(...components: Components) => TupleD<Components>

export interface ArrayD<Item>
  extends Decoder<unknown, LeafE<UnknownArrayE> | ArrayE<ErrorOf<Item>>, Array<TypeOf<Item>>> {
  readonly _tag: 'ArrayD'
  readonly item: Item
}
export declare const array: <Item extends AnyUD>(item: Item) => ArrayD<Item>

export interface RecordD<Codomain>
  extends Decoder<unknown, LeafE<UnknownRecordE> | RecordE<ErrorOf<Codomain>>, Record<string, TypeOf<Codomain>>> {
  readonly _tag: 'RecordD'
  readonly codomain: Codomain
}
export declare const record: <Codomain extends AnyUD>(codomain: Codomain) => RecordD<Codomain>

export interface SumD<T extends string, Members>
  extends Decoder<
    unknown,
    LeafE<UnknownRecordE> | LeafE<TagE<keyof Members>> | SumE<ErrorOf<Members[keyof Members]>>,
    TypeOf<Members[keyof Members]>
  > {
  readonly _tag: 'SumD'
  readonly tag: T
  readonly members: Members
}
// TODO: every `Members` should own a tag field
export declare const sum: <T extends string>(
  tag: T
) => <Members extends Record<string, AnyUD>>(members: Members) => SumD<T, Members>

// -------------------------------------------------------------------------------------
// composition
// -------------------------------------------------------------------------------------

export interface IdentityD<A> extends Decoder<A, never, A> {
  readonly _tag: 'IdentityD'
}

declare const id: <A>() => IdentityD<A>

export interface CompositionD<F, S> extends Decoder<InputOf<F>, ErrorOf<F> | ErrorOf<S>, TypeOf<S>> {
  readonly _tag: 'CompositionD'
  readonly first: F
  readonly second: S
}

export declare function compose<S extends AnyD>(second: S): <F extends AnyD>(first: F) => CompositionD<F, S>

// -------------------------------------------------------------------------------------
// use case: mapLeft
// -------------------------------------------------------------------------------------

export const MapLeftExample = struct({
  a: string,
  b: number
})

// the decode error is fully typed...
// type MapLeftExampleE = LeafE<UnknownRecordE> | StructE<LeafE<StringE> | LeafE<NumberE>>
export type MapLeftExampleE = ErrorOf<typeof MapLeftExample>

// ...this means that you can pattern match on the error
// when you are mapping
export const result1 = pipe(
  MapLeftExample.decode({}),
  E.mapLeft((de) => {
    switch (de._tag) {
      case 'LeafE':
        // leafE: UnknownRecordE
        const leafE = de.error
        return `cannot decode ${leafE.actual}, should be a Record<string, unknown>`
      case 'StructE':
        // nonEmpty: RNEA.ReadonlyNonEmptyArray<KeyE<LeafE<StringE> | LeafE<NumberE>>>
        const nonEmpty = de.error
        return nonEmpty.map((e) => `${e.key}: ${e.error}`).join('\n')
    }
  })
)

// -------------------------------------------------------------------------------------
// use case: custom leaf error
// -------------------------------------------------------------------------------------

interface NonEmptyStringBrand {
  readonly NonEmptyString: unique symbol
}
export type NonEmptyString = string & NonEmptyStringBrand
export interface NonEmptyStringE extends ActualE<string> {
  readonly _tag: 'NonEmptyStringE'
}
declare const nonEmptyStringE: (actual: string) => NonEmptyStringE
export const NonEmptyString = pipe(
  id<string>(),
  refine(
    (s): s is NonEmptyString => s.length > 0,
    (actual) => leafE(nonEmptyStringE(actual))
  )
)

// -------------------------------------------------------------------------------------
// use case: handling a generic error, for example drawing a tree
// -------------------------------------------------------------------------------------

export interface Tree<A> {
  readonly value: A
  readonly forest: ReadonlyArray<Tree<A>>
}

const empty: Array<never> = []

const tree = <A>(value: A, forest: ReadonlyArray<Tree<A>> = empty): Tree<A> => ({
  value,
  forest
})

export const drawWith = <E>(leafEncoder: (e: E) => Tree<string>) => (de: DecodeError<E>): Tree<string> => {
  switch (de._tag) {
    case 'LeafE':
      return leafEncoder(de.error)
    case 'ArrayE':
      return tree(
        `cannot decode ${de.actual}`,
        de.error.map((indexE) => tree(`cannot decode index ${indexE.index}`))
      )
    // etc...
    default:
      return tree('TODO')
  }
}

export const defaultLeafEncoder = (e: DefaultLeafE): Tree<string> => tree(e._tag)

export const draw = drawWith(defaultLeafEncoder)

const DR1 = fromStruct({
  a: string,
  b: number
})

export const treeOutput1 = pipe(DR1.decode({ a: null, b: null }), E.mapLeft(draw))

// what if the decoder contains a custom error?

const DR2 = fromStruct({
  a: NonEmptyString,
  b: number
})

// export const treeOutput2 = pipe(DR2.decode({ a: '', b: null }), E.mapLeft(draw)) // <= type error because `NonEmptyStringE` is not handled

// I can define my own `leafEncoder`
const myLeafEncoder = (e: DefaultLeafE | NonEmptyStringE) => {
  switch (e._tag) {
    case 'NonEmptyStringE':
      return tree(`cannot decode ${e.actual}, should be a non empty string`)
    default:
      return defaultLeafEncoder(e)
  }
}

export const treeOutput2 = pipe(DR2.decode({ a: '', b: null }), E.mapLeft(drawWith(myLeafEncoder))) // <= ok

// -------------------------------------------------------------------------------------
// use case: Schemable
// -------------------------------------------------------------------------------------

export interface Schemable<S> {
  readonly URI: S
  readonly string: HKT<S, string>
  readonly number: HKT<S, number>
  readonly boolean: HKT<S, boolean>
  readonly nullable: <A>(or: HKT<S, A>) => HKT<S, null | A>
}

export interface Schemable1<S extends URIS> {
  readonly URI: S
  readonly string: Kind<S, string>
  readonly number: Kind<S, number>
  readonly boolean: Kind<S, boolean>
  readonly nullable: <A>(or: Kind<S, A>) => Kind<S, null | A>
}

export interface Schemable2C<S extends URIS2, E> {
  readonly URI: S
  readonly string: Kind2<S, E, string>
  readonly number: Kind2<S, E, number>
  readonly boolean: Kind2<S, E, boolean>
  readonly nullable: <A>(or: Kind2<S, E, A>) => Kind2<S, E, null | A>
}

export const URI = 'io-ts/Decoder2'

export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    readonly [URI]: Decoder<unknown, E, A>
  }
}

export interface Schema<A> {
  <S>(S: Schemable<S>): HKT<S, A>
}

export declare const make: <A>(schema: Schema<A>) => Schema<A>

export declare function interpreter<S extends URIS2, E>(S: Schemable2C<S, E>): <A>(schema: Schema<A>) => Kind2<S, E, A>
export declare function interpreter<S extends URIS>(S: Schemable1<S>): <A>(schema: Schema<A>) => Kind<S, A>
export declare function interpreter<S>(S: Schemable<S>): <A>(schema: Schema<A>) => HKT<S, A>

export declare const getSchemable: <E>() => Schemable2C<URI, DecodeError<E>>

const schemaS = make((S) => S.nullable(S.string))
const toDecoder = interpreter(getSchemable<StringE | NumberE | BooleanE>())

// const schemaD: Decoder<unknown, DecodeError<StringE | NumberE | BooleanE>, string | null>
export const schemaD = toDecoder(schemaS)

// -------------------------------------------------------------------------------------
// examples
// -------------------------------------------------------------------------------------

// literal
export const LDU = literal(1, true)
export type LDUI = InputOf<typeof LDU>
export type LDUE = ErrorOf<typeof LDU>
export type LDUA = TypeOf<typeof LDU>

// fromStruct
export const SD = fromStruct({
  a: string,
  b: number
})
export type SDI = InputOf<typeof SD>
export type SDE = ErrorOf<typeof SD>
export type SDA = TypeOf<typeof SD>

// struct
export const SUD = struct({
  a: string,
  b: number
})
export type SUDI = InputOf<typeof SUD>
export type SUDE = ErrorOf<typeof SUD>
export type SUDA = TypeOf<typeof SUD>

// fromPartial
export const PSD = fromPartial({
  a: string,
  b: number
})
export type PSDI = InputOf<typeof PSD>
export type PSDE = ErrorOf<typeof PSD>
export type PSDA = TypeOf<typeof PSD>

// partial
export const PSUD = partial({
  a: string,
  b: number
})
export type PSUDE = ErrorOf<typeof PSUD>
export type PSUDA = TypeOf<typeof PSUD>

// fromTuple
export const TD = fromTuple(string, number)
export type TDI = InputOf<typeof TD>
export type TDE = ErrorOf<typeof TD>
export type TDA = TypeOf<typeof TD>

// tuple
export const TUD = tuple(string, number)
export type TUDE = ErrorOf<typeof TUD>
export type TUDA = TypeOf<typeof TUD>

// fromArray
export const AD = fromArray(string)
export type ADI = InputOf<typeof AD>
export type ADE = ErrorOf<typeof AD>
export type ADA = TypeOf<typeof AD>

// array
export const AUD = array(string)

// fromRecord
export const RD = fromRecord(number)
export type RDI = InputOf<typeof RD>
export type RDE = ErrorOf<typeof RD>
export type RDA = TypeOf<typeof RD>

// record
export const RUD = record(number)

// refine
export type NonEmptyStringDI = InputOf<typeof NonEmptyString>
export type NonEmptyStringDE = ErrorOf<typeof NonEmptyString>
export type NonEmptyStringDA = TypeOf<typeof NonEmptyString>

const NonEmptyStringUD = pipe(string, compose(NonEmptyString))
export type NonEmptyStringUDE = ErrorOf<typeof NonEmptyStringUD>
export type NonEmptyStringUDA = TypeOf<typeof NonEmptyStringUD>

export interface IntBrand {
  readonly Int: unique symbol
}
export type Int = number & IntBrand
export interface IntE {
  readonly _tag: 'IntE'
}
export declare const intE: IntE
export const IntD = pipe(
  id<number>(),
  refine(
    (n): n is Int => Number.isInteger(n),
    () => leafE(intE)
  )
)
export const IntUD = pipe(number, compose(IntD))

// union
export const UD = union(NonEmptyString, IntD)
export type UDI = InputOf<typeof UD>
export type UDE = ErrorOf<typeof UD>
export type UDA = TypeOf<typeof UD>

export const UUD = union(string, number)
export type UUDE = ErrorOf<typeof UUD>
export type UUDA = TypeOf<typeof UUD>

// nullable
export const ND = nullable(NonEmptyString)
export type NDI = InputOf<typeof ND>
export type NDE = ErrorOf<typeof ND>
export type NDA = TypeOf<typeof ND>

export const NUD = nullable(string)
export type NUDE = ErrorOf<typeof NUD>
export type NUDA = TypeOf<typeof NUD>

// parse
interface ParseNumberE {
  readonly _tag: 'ParseNumberE'
}
declare const parseNumber: (s: string) => E.Either<ParseNumberE, number>
const PD = pipe(id<string>(), parse(parseNumber))
export type PDI = InputOf<typeof PD>
export type PDE = ErrorOf<typeof PD>
export type PDA = TypeOf<typeof PD>

const PUD = pipe(string, parse(parseNumber))
export type PUDE = ErrorOf<typeof PUD>
export type PUDA = TypeOf<typeof PUD>

// intersect
export const ID = pipe(fromStruct({ a: string }), intersect(fromStruct({ b: number })))
export type IDI = InputOf<typeof ID>
export type IDE = ErrorOf<typeof ID>
export type IDA = TypeOf<typeof ID>

export const IUD = pipe(struct({ a: string }), intersect(struct({ b: number })))
export type IUDE = ErrorOf<typeof IUD>
export type IUDA = TypeOf<typeof IUD>

// lazy
interface Category {
  name: string
  categories: ReadonlyArray<Category>
}
// Note: getting the error type is quite difficult.
interface ReadonlyArrayCategoryE extends ArrayE<CategoryE> {}
type CategoryE = LazyE<
  | LeafE<UnknownRecordE>
  | StructE<LeafE<StringE> | RefineE<LeafE<NonEmptyStringE>> | LeafE<UnknownArrayE> | ReadonlyArrayCategoryE>
>
// A possible solution is using DecodeError<E>
// type CategoryE = DecodeError<StringE | NonEmptyStringE | UnknownArrayE | UnknownRecordE>
export const LaUD: Decoder<unknown, CategoryE, Category> = lazy('Category', () =>
  struct({
    name: NonEmptyStringUD,
    categories: array(LaUD)
  })
)
export type LaUDE = ErrorOf<typeof LaUD>
export type LaUDA = TypeOf<typeof LaUD>

// sum
export const SumD = fromSum('type')({
  A: fromStruct({ type: literal('A'), a: string }),
  B: fromStruct({ type: literal('B'), b: string })
})
export type SumDI = InputOf<typeof SumD>
export type SumDE = ErrorOf<typeof SumD>
export type SumDA = TypeOf<typeof SumD>

const sumType = sum('type')
export const SumUD = sumType({
  A: struct({ type: literal('A'), a: string }),
  B: struct({ type: literal('B'), b: string })
})
export type SumUDE = ErrorOf<typeof SumUD>
export type SumUDA = TypeOf<typeof SumUD>

// all
const AllD = fromStruct({
  a: LDU,
  b: TD,
  c: AD,
  d: RD,
  e: UD,
  f: ND,
  g: NonEmptyString,
  h: PD,
  i: ID
})
export type AllDI = InputOf<typeof AllD>
export type AllDE = ErrorOf<typeof AllD>
export type AllDA = TypeOf<typeof AllD>

const AllUD = struct({
  a: LDU,
  b: SUD,
  c: TUD,
  d: AUD,
  e: RUD,
  f: UUD,
  g: NUD,
  h: NonEmptyStringUD,
  i: PUD,
  l: IUD
})
export type AllUDE = ErrorOf<typeof AllUD>
export type AllUDA = TypeOf<typeof AllUD>

// -------------------------------------------------------------------------------------
// form
// -------------------------------------------------------------------------------------

export declare const toFormErrors: <Properties>(struct: {
  readonly properties: Properties
}) => (error: StructE<ErrorOf<Properties[keyof Properties]>>) => { [K in keyof Properties]?: ErrorOf<Properties[K]> }

const MyForm = fromStruct({
  name: NonEmptyStringUD,
  age: number
})

pipe(
  MyForm.decode({ name: null, age: null }),
  E.mapLeft((e) => {
    const form = pipe(e, toFormErrors(MyForm))
    /*
    const form: {
        name?: StringE | RefineE<NonEmptyStringE> | undefined;
        age?: NumberE | undefined;
    }
    */
    console.log(form)
    return e
  })
)