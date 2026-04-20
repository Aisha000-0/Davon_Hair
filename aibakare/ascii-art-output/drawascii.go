package main

import (
	"strings"
)

func DrawASCII(theText string, fileSplit []string) string {
	finalOutput := ""

	userInput := strings.Split(theText, "\\n")

	for i, word := range userInput {
		if word != "" {
			for row := 0; row < 8; row++ {
				for _, char := range word {
					indexCalc := (int(char)-32)*9 + 1 + row
					finalOutput += (fileSplit[indexCalc])
				}
				finalOutput += "\n"
			}
		} else {
			if len(userInput)-1 != i {
				finalOutput += "\n"
			}
		}
	}
	return finalOutput
}
