package main 

import (
	"fmt"
	"os"
	"regexp"
	"strconv"
	"strings"
	"unicode"
)

func main() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: go run . <sample.txt> <result.txt>")
		return
	}

	argument := os.Args[1]
	argument2 := os.Args[2]
	storage, err := os.ReadFile(argument)

	if err != nil {
		fmt.Println("error", err)
		return
	}
	text := string(storage)

	Slice := strings.Fields(text)
    for i := 0; i < len(Slice)-1; i++ {
        if strings.HasPrefix(Slice[i], "(") && !strings.HasSuffix(Slice[i], ")") {
        Slice[i] = Slice[i] + Slice[i+1]
        Slice = append(Slice[:i+1], Slice[i+2:]...)
		}
	}
 
    for i, word := range Slice {
		fmt.Println(i, word)
		if word == "(hex)" && i > 0 {

			target_hex := Slice[i-1]

			target_conv, err := strconv.ParseInt(target_hex, 16, 64)

			if err != nil {
				fmt.Println("Error", err)

			}
			Slice[i-1] = fmt.Sprint(target_conv)
			Slice[i] = ""
			fmt.Println(Slice)
			fmt.Println(target_conv)

		} else if word == "(bin)" && i > 0 {

			target_bin := Slice[i-1]

			targetconv, err := strconv.ParseInt(target_bin, 2, 64)

			if err != nil {
				fmt.Println("error", err)

			}

			Slice[i-1] = fmt.Sprint(targetconv)
			Slice[i] = ""
			fmt.Println(Slice)
			fmt.Println(targetconv)

		} else if strings.HasPrefix(word, "(low") {
			count := getCount(word)
			applyToPrevious(Slice, i, count, strings.ToLower)
			Slice[i] = ""
		} else if strings.HasPrefix(word, "(up") {
			count := getCount(word)
			applyToPrevious(Slice, i, count, strings.ToUpper)
			Slice[i] = ""
		} else if strings.HasPrefix(word, "(cap") {
			count := getCount(word)
			applyToPrevious(Slice, i, count, func(s string) string {
				r := []rune(s)
				if len(r) > 0 {
					r[0] = unicode.ToUpper(r[0])
				}
				return string(r)
			})
			Slice[i] = ""
		}

	}
	text = strings.Join(Slice, " ")
	text = formatText(text)
	fmt.Println(text)

	file, _ := os.Create(argument2)
	file.WriteString(text)
	file.Close()
}
func formatText(text string) string {
	text = regexp.MustCompile(`\ba ([aeiouhAEIOUH])`).ReplaceAllString(text, "an $1")
	text = regexp.MustCompile(`\bA ([aeiouhAEIOUH])`).ReplaceAllString(text, "An $1")
	text = regexp.MustCompile(`\s+([.,!?;:])`).ReplaceAllString(text, "$1")
	text = regexp.MustCompile(`([.,!?;:])([^\s.,!?;:])`).ReplaceAllString(text, "$1 $2")

	return text
}
func applyToPrevious(Slice []string, currentIndex int, n int, transform func(string) string) {
	start := currentIndex - n
	if start < 0 {
		start = 0
	}
	for i := start; i < currentIndex; i++ {
		Slice[i] = transform(Slice[i])
	}

}
func getCount(word string) int {
	word = strings.TrimPrefix(word, "(")
	word = strings.TrimSuffix(word, ")")
	parts := strings.SplitN(word, ",", 2)
	if len(parts) < 2 {
		return 1
	}
	n, err := strconv.Atoi(strings.TrimSpace(parts[1]))
	if err != nil || n < 1 {
		return 1
	}
	return n
	
}
