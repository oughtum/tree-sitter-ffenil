;----------;
; KEYWORDS ;
;----------;
[
  "inherit"
  "with"
  "scoped"
  "match"
  "do"
  "let"
  "mut"
  "in"
] @keyword

[
  "import"
  "merge"  
] @keyword.import

[
  "enum"
  "type"
] @keyword.type

[  
  "if"
  "then"
  "else"
] @keyword.conditional

[
  "and"
  "or"
] @keyword.operator

("return") @keyword.return

("pub") @keyword.modifier

;---------;
; MODULES ;
;---------;

(module_path (identifier)) @namespace
(module_path . (identifier) @variable.builtin (#eq? @variable.builtin "root"))
  
;----------;
; LITERALS ;
;----------;
(string) @string

[
  (int)
  (float)
  (bool)
] @constant

;--------------;
; DECLARATIONS ;
;--------------;
(enum_definition
  name: (identifier) @type)

(var_declaration
  (identifier) @variable)

(assignment
  (get
    (module_path
      (identifier) @variable .)))
(expr
  (primary
    (literal
      (identifier) @variable.other.member)))

;-------;
; TYPES ;
;-------;
(type) @type
(primitive_type) @type.builtin
(type_alias
  (identifier) @type.other.definition)
[
  (unit) 
  (unit_type)
] @punctuation.bracket

;-----------------;
; DATA STRUCTURES ;
;-----------------;
[
  (record_key (identifier))
  (record_field (identifier))
] @variable.other.member

(enum_definition_variant
  (identifier) @type.enum.variant)
(get
  (record_key
    (identifier) @variable.other.member))
(get
  (module_path
    (identifier) @type .
      (#match? @type "^[A-Z_][a-zA-Z0-9_]*'*") .))
(literal
  (identifier) @type
    (#match? @type "^[A-Z_][a-zA-Z0-9_]*'*") .)

(call
  func: (expr
    (primary
      [
        (get
          (record_key (identifier) @function.call))
        (get
          (module_path
            (identifier) @function.call
              (#match? @function.call "^[a-z_][a-zA-Z0-9_]*'*") .))
        (literal
          (identifier) @function.call
            (#match? @function.call "^[a-z_][a-zA-Z0-9_]*'*") .)
        (get
          (module_path
            (identifier) @constructor
              (#match? @constructor "^[A-Z_][a-zA-Z0-9_]*'*") .))
        (literal
          (identifier) @constructor
            (#match? @constructor "^[A-Z_][a-zA-Z0-9_]*'*") .)
      ])))
(closure
  (identifier) @variable.parameter)

;---------;
; SYMBOLS ;
;---------;
[
  "!"
  "!="
  "=="
  ">"
  ">="
  "<"
  "<="
  "|>"
  "-"
  "+"
  "++"
  "%"
  "*"
  "/"
  "//"
] @operator

[
  "?"
  "="
  "=>"
  ":"
  "::"
  "|"
  ".."
  "->"
  "<-"
] @punctuation.special

[
  "."
  ","
  ";"
] @punctuation.delimiter

[
  "("
  ")"
  "{"
  "}"
  "["
  "]" 
] @punctuation.bracket

(closure "|" @punctuation.delimiter)

;----------;
; COMMENTS ;
;----------;
(comment) @comment

[
  (doc_comment "@-")
  (doc_comment "-@")
] @comment
