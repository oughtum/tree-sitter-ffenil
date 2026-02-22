package tree_sitter_ffenil_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_ffenil "github.com:oughtum/tree-sitter-ffenil/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_ffenil.Language())
	if language == nil {
		t.Errorf("Error loading Ffenil grammar")
	}
}
