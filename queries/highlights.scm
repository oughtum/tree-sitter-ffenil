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
[
  (module_path (identifier))
  (module_group (module_path (identifier)))
] @namespace
  
(module_path
  . (identifier) @variable.builtin (#eq? @variable.builtin "self"))
(module_path
  . (identifier) @variable.builtin (#eq? @variable.builtin "root"))
(module_group
  (module_path
    . (identifier) @variable.builtin (#eq? @variable.builtin "self")))
(module_group
  (module_path
    . (identifier) @variable.builtin (#eq? @variable.builtin "root")))

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
(enum_destructure
  (module_path
    (identifier) @type.enum.variant .))
(destructure
  (literal
    (identifier) @variable.other.member))
(get
  (record_key
    (identifier) @variable.other.member))
(call
  func: (expr
    (primary
      [
        (get
          [
            (record_key
              (identifier) .)
            (module_path
              (identifier) .)
          ] @function.call)
        (literal
          (identifier))
      ] @function.call)))

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
