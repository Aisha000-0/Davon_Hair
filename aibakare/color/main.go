package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: go run . [OPTION] [STRING]\nEX: go run . --color=<color> <substring to be colored> \"something\"")
		return
	}
	if !strings.HasPrefix(os.Args[1], "--color=") {
		printAsciiArt(os.Args[1], "", "")
		return
	}
	splited := strings.TrimPrefix(os.Args[1], "--color=")
	colorCode := getColorCode(splited)
	reset := "\033[0m"
	if len(os.Args) == 4 {
		substring := os.Args[2]
		text := os.Args[3]
		text = strings.ReplaceAll(text, "\\n", "\n")
		printAsciiArt(text, substring, colorCode)
		return
	}
	argument := os.Args[2]
	fmt.Print(colorCode)
	printAsciiArt(argument, "", colorCode)
	fmt.Print(reset)
}
func getColorCode(color string) string {
	switch color {
	case "red":
		return "\033[31m"
	case "yellow":
		return "\033[33m"
	case "magenta":
		return "\033[35m"
	default:
		return ""
	}
}
func printAsciiArt(input, substring, colorCode string) {
	data, err := os.ReadFile("standard.txt")
	if err != nil {
		fmt.Println("Error: file not found")
		return
	}

	reset := "\033[0m"
	lines := strings.Split(string(data), "\n")

	inputLines := strings.Split(input, "\n")

	for n, line := range inputLines {

		for row := 0; row < 8; row++ {
			remaining := 0

			for i := 0; i < len(line); i++ {

				isMatch := substring != "" &&
					i+len(substring) <= len(line) &&
					line[i:i+len(substring)] == substring

				if isMatch {
					fmt.Print(colorCode)
					remaining = len(substring)
				}

				ch := line[i]
				if ch < 32 || ch > 126 {
					ch = '?'
				}

				index := (int(ch)-32)*9 + 1

				if index+row >= len(lines) || index < 0 {
					fmt.Print(" ")
				} else {
					fmt.Print(lines[index+row])
				}

				if remaining > 0 {
					remaining--
					if remaining == 0 {
						fmt.Print(reset)
					}
				}
			}
			fmt.Println()
		}

		// add space between lines (except last one)
		if n < len(inputLines)-1 {
			fmt.Println()
		}
	}
}
