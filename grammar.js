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
const IMPORT = "import";
const MERGE = "merge";
const TRUE = "true";
const FALSE = "false";
const IF = "if";
const THEN = "then";
const ELSE = "else";
const ENUM = "enum";
const TYPE = "type";
const INHERIT = "inherit";
const WITH = "with";
const SCOPED = "scoped";
const MATCH = "match";
const PUB = "pub";
const AND = "and";
const OR = "or";
const DO = "do";
const LET = "let";
const MUT = "mut";
const IN = "in";
const RETURN = "return";
const SELF = "self";
const ROOT = "root";

module.exports = grammar({
  name: "ffenil",

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
      IMPORT,
      MERGE,
      TRUE,
      FALSE,
      IF,
      THEN,
      ELSE,
      ENUM,
      TYPE,
      INHERIT,
      WITH,
      SCOPED,
      MATCH,
      PUB,
      AND,
      OR,
      DO,
      LET,
      MUT,
      IN,
      RETURN,
      SELF,
      ROOT
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
        seq(IMPORT, optional(MERGE)),
        seq(MERGE, optional(IMPORT))
      ),
      choice(
        $.module_group,
        $._submodule_group
      ),
      ";"
    ),
    //  foo::{ bar::{ baz, quux }, corge }
    // { foo, bar, baz::quux }
    // foo::bar::baz

    // foo::bar::baz::quux::{}
    
    module_group: $ => seq(
      "{",
      $._submodule_group,
      repeat(seq(",", $._submodule_group)),
      optional(","),
      "}"
    ),
    _submodule_group: $ => seq($.module_path, optional(seq("::", $.module_group))),
    module_path: $ => seq(
      $.identifier,
      repeat(seq("::", $.identifier))
    ),

    //------------//
    // STATEMENTS //
    //------------//
    statement: $ => seq(
      optional(PUB),
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
      TYPE,
      $.identifier,
      "=",
      $.type
    ),
    enum_definition: $ => seq(
      ENUM,
      field("name", $.identifier),
      "=",
      $.enum_definition_variant,
      repeat1(seq("|", $.enum_definition_variant))
    ),
    enum_definition_variant: $ => seq($.identifier, optional($.type)),
    return: $ => seq(RETURN, $.expr, ";"),

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
      prec.left(2, seq($.expr, OR, $.expr)),
      prec.left(3, seq($.expr, AND, $.expr)),
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
      IF,
      $.expr,
      THEN,
      $.expr,
      ELSE,
      $.expr
    ),
    let_in: $ => seq(
      LET,
      repeat1(
        seq(choice(
            seq(optional(MUT), $.var_declaration),
            $.assignment
          ),
        ";"
      )),
      IN,
      $.expr
    ),
    do: $ => prec.left(0, seq(DO, $.expr, repeat(seq(",", $.expr)))),
    with: $ => prec.left(0, seq(
      WITH,
      optional(SCOPED),
      $.expr,
      ";",
      $.expr
    )),
    match: $ => prec.left(0, seq(
      MATCH,
      $.expr,
      ";",
      $.match_arm,
      repeat(seq(",", $.match_arm))
    )),
    match_arm: $ => seq($.destructure, "=>", $.expr),
    destructure: $ => choice(
      $.tuple_destructure,
      $.enum_destructure,
      $.record_destructure,
      $.grouping_destructure,
      $.literal
    ),
    tuple_destructure: $ => seq(
      "(",
      $.destructure,
      repeat1(seq(",", $.destructure)),
      ")"
    ),
    enum_destructure: $ => seq($.module_path, $.destructure),
    record_destructure: $ => seq(
      "{",
      $.record_key,
      repeat(seq(",", $.record_key)),
      optional(seq(",", "..")),
      "}"
    ),
    grouping_destructure: $ => seq("(", $.destructure, ")"),
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
      $.record_field,
      repeat(seq(",", $.record_field)),
      optional(","),
      "}"
    ),
    record_key: $ => choice($.identifier, $.string),
    record_field: $ => choice(
      seq($.record_key, "=", $.expr),
      seq(INHERIT, repeat1($.identifier)),
      seq("..", $.record_key)
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
      $.record_field_type,
      repeat(seq(",", $.record_field_type)),
      optional(seq(",", "..")),
      optional(","),
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
    bool: _ => choice(TRUE, FALSE),

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
