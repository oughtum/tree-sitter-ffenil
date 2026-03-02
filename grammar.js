/**
 * @file Ffenil grammar for tree-sitter
 * @author Autumn Baker <autumnbakerev@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

//----------//
// KEYWORDS //
//----------//
const KEYWORDS = {
  import: "import",
  merge: "merge",
  true: "true",
  false: "false",
  if: "if",
  then: "then",
  else: "else",
  enum: "enum",
  type: "type",
  inherit: "inherit",
  with: "with",
  scoped: "scoped",
  match: "match",
  pub: "pub",
  and: "and",
  or: "or",
  do: "do",
  let: "let",
  mut: "mut",
  in: "in",
  return: "return",
  root: "root"
};

module.exports = grammar({
  name: "ffenil",

  word: $ => $.identifier,

  extras: $ => [
    /\s/, // whitespace
    $.comment,
    $.doc_comment
  ],

  conflicts: $ => [
    [$.call, $.unary, $.binary],
    [$.call, $.binary],
    [$.module_path]
  ],

  reserved: {
    global: _ => [
      KEYWORDS.import,
      KEYWORDS.merge,
      KEYWORDS.true,
      KEYWORDS.false,
      KEYWORDS.if,
      KEYWORDS.then,
      KEYWORDS.else,
      KEYWORDS.enum,
      KEYWORDS.type,
      KEYWORDS.inherit,
      KEYWORDS.with,
      KEYWORDS.scoped,
      KEYWORDS.match,
      KEYWORDS.pub,
      KEYWORDS.and,
      KEYWORDS.or,
      KEYWORDS.do,
      KEYWORDS.let,
      KEYWORDS.mut,
      KEYWORDS.in,
      KEYWORDS.return,
      KEYWORDS.root
    ]
  },

  rules: {
    source_file: $ => seq(
      repeat($.imports),
      choice(
        seq(repeat1($.statement), optional($.return)),
        $.return
      )
    ),

    //---------//
    // IMPORTS //
    //---------//        
    imports: $ => seq(
      choice(
        seq(KEYWORDS.import, optional(KEYWORDS.merge)),
        seq(KEYWORDS.merge, optional(KEYWORDS.import))
      ),
      $.module_path,
      ";"
    ),
    module_path: $ => seq(
      choice(KEYWORDS.root, $.identifier),
      repeat(seq("::", $.identifier))
    ),

    //------------//
    // STATEMENTS //
    //------------//
    statement: $ => seq(
      optional($.doc_comment),
      optional(KEYWORDS.pub),
      choice(
        $.var_declaration,
        $.type_alias,
        $.enum_definition
      ),
      ";"
    ),
    var_declaration: $ => seq(
      $.identifier,
      optional(seq(":", $.type)),
      "=",
      $.expr
    ),
    assignment: $ => seq($.get, "<-", $.expr),
    type_alias: $ => seq(
      KEYWORDS.type,
      $.identifier,
      "=",
      $.type
    ),
    enum_definition: $ => seq(
      KEYWORDS.enum,
      field("name", $.identifier),
      "=",
      $.enum_definition_variant,
      repeat1(seq("|", $.enum_definition_variant))
    ),
    enum_definition_variant: $ => seq($.identifier, optional($.type)),
    return: $ => seq(KEYWORDS.return, $.expr, ";"),

    //-------------//
    // EXPRESSIONS //
    //-------------//
    expr: $ => choice(
      $.unary,
      $.binary,
      $.call,
      $.primary
    ),
    unary: $ => prec(10, choice(
      seq("-", $.expr),
      seq("!", $.expr)
    )),
    binary: $ => choice(
      prec.left(1, seq($.expr, "|>", $.expr)),
      prec.left(2, seq($.expr, KEYWORDS.or, $.expr)),
      prec.left(3, seq($.expr, KEYWORDS.and, $.expr)),
      prec.left(4, seq($.expr, "==", $.expr)),
      prec.left(4, seq($.expr, "!=", $.expr)),
      prec.left(5, seq($.expr, "<", $.expr)),
      prec.left(5, seq($.expr, ">", $.expr)),
      prec.left(5, seq($.expr, "<=", $.expr)),
      prec.left(5, seq($.expr, ">=", $.expr)),
      prec.left(6, seq($.expr, "//", $.expr)),
      prec.left(7, seq($.expr, "+", $.expr)),
      prec.left(7, seq($.expr, "-", $.expr)),
      prec.left(8, seq($.expr, "*", $.expr)),
      prec.left(8, seq($.expr, "/", $.expr)),
      prec.left(8, seq($.expr, "%", $.expr)),
      prec.left(9, seq($.expr, "++", $.expr))
    ),
    call: $ => prec.left(11, seq(field("func", $.expr), field("arg", $.expr))),
    primary: $ => prec(12, choice(
      $.if_then_else,
      $.let_in,
      $.do,
      $.with,
      $.match,
      $.tuple,
      $.array,
      $.record,
      $.closure,
      $.grouping,
      $.literal,
      $.unit,
      $.get
    )),
    if_then_else: $ => seq(
      KEYWORDS.if,
      $.expr,
      KEYWORDS.then,
      $.expr,
      KEYWORDS.else,
      $.expr
    ),
    let_in: $ => seq(
      KEYWORDS.let,
      repeat1(
        seq(choice(
            seq(optional(KEYWORDS.mut), $.var_declaration),
            $.assignment
          ),
        ";"
      )),
      KEYWORDS.in,
      $.expr
    ),
    do: $ => prec.left(0, seq(KEYWORDS.do, $.expr, repeat(seq(",", $.expr)))),
    with: $ => prec.left(0, seq(
      KEYWORDS.with,
      optional(KEYWORDS.scoped),
      $.expr,
      ";",
      $.expr
    )),
    match: $ => prec.left(0, seq(
      KEYWORDS.match,
      $.expr,
      ";",
      $.match_arm,
      repeat(seq(",", $.match_arm))
    )),
    match_arm: $ => seq($.expr, "=>", $.expr),
    get: $ => prec(13, seq($.module_path, repeat(seq(".", $.record_key)))),
    tuple: $ => seq(
      "(",
      $.expr,
      repeat1(seq(",", $.expr)),
      optional(","),
      ")"
    ),
    array: $ => seq(
      "[",
      optional(seq(
        $.expr,
        repeat(seq(",", $.expr)),
        optional(",")
      )),
      "]"
    ),
    record: $ => seq(
      "{",
      optional(seq(
        $.record_field,
        repeat(seq(",", $.record_field)),
        optional(",")
      )),
      "}"
    ),
    record_key: $ => choice($.identifier, $.string),
    record_field: $ => choice(
      seq($.record_key, "=", $.expr),
      seq(KEYWORDS.inherit, repeat1($.identifier)),
      seq("..", $.identifier)
    ),
    closure: $ => seq(
      "|",
      $.identifier,
      ":",
      $.type,
      "|",
      $.expr
    ),

    grouping: $ => seq("(", $.expr, ")"),
    unit: _ => "()",

    //-------//
    // TYPES //
    //-------//
    type: $ => choice(
      $.closure_type,
      $.tuple_type,
      $.array_type,
      $.record_type,
      $.primitive_type,
      $.grouping_type,
      $.unit_type      
    ),
    closure_type: $ => prec.right(1, seq($.type, "->", $.type)),
    tuple_type: $ => seq(
      "(",
      $.type,
      repeat1(seq(",", $.type)),
      optional(","),
      ")"
    ),
    array_type: $ => seq("[", $.type, "]"),
    record_type: $ => seq(
      "{",
      optional(seq(
        $.record_field_type,
        repeat(seq(",", $.record_field_type)),
        optional(seq(",", "..")),
        optional(",")
      )),
      "}"
    ),
    record_field_type: $ => seq(
      $.record_key,
      optional("?"),
      ":",
      $.type
    ),
    grouping_type: $ => seq("(", $.type, ")"),
    unit_type: $ => $.unit,
    
    primitive_type: $ => choice(
      $.string_type,
      $.int_type,
      $.float_type,
      $.bool_type,
      $.any_type
    ),
    string_type: _ => "str",
    int_type: _ => "int",
    float_type: _ => "float",
    bool_type: _ => "bool",
    any_type: _ => "any",

    //----------//
    // LITERALS //
    //----------//
    literal: $ => prec(1, choice(
      $.string,
      $.float,
      $.int,
      $.bool,
      $.identifier
    )),

    identifier: _ => /[a-zA-Z_][a-zA-Z0-9_\-']*/,

    string: $ => choice($.raw_string, $.normal_string),
    normal_string: _ => /"[^"]+"/,
    // our raw string syntax allows a dynamic number of `#` to avoid conflicts
    // within the string itself, however that's only possible with an external scanner
    // written in C, and I don't know C :c
    raw_string: _ => /r#"([^"]|[^#])*"#/,

    int: $ => choice(
      $.decimal_int,
      $.binary_int,
      $.octal_int,
      $.hex_int
    ),
    decimal_int: _ => /[0-9]+/,
    binary_int: _ => /0b[0-1]+/,
    octal_int: _ => /0o[0-7]+/,
    hex_int: _ => /0x[0-9a-fA-F]+/,

    float: _ => /[0-9]+[.][0-9]+/,
    bool: _ => choice(KEYWORDS.true, KEYWORDS.false),

    //----------//
    // COMMENTS //
    //----------//
    comment: _ => token(choice(
      seq("--", /.*/),
      seq("{-", /[^-}]*/, "-}")
    )),
    doc_comment: $ => seq("@-", $.doc_comment_text, "-@"),
    doc_comment_text: _ => /[^-@]*/,
  }
});
