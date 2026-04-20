package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	var outputFlag, theText, bannerName, outputFile, fileName, finalOutput string

	argCount := len(os.Args)

	switch argCount {
	case 2:
		theText = os.Args[1]
		bannerName = "standard"
	case 3:
		theText = os.Args[1]
		bannerName = os.Args[2]
	case 4:
		outputFlag = os.Args[1]
		theText = os.Args[2]
		bannerName = os.Args[3]
	default:
		fmt.Println("Usage: go run . [OPTION] [STRING] [BANNER]\n\nEX: go run . --output=<fileName.txt> something standard")
		return
	}

	switch bannerName {
	case "standard":
		fileName = "standard.txt"
	case "shadow":
		fileName = "shadow.txt"
	case "thinkertoy":
		fileName = "thinkertoy.txt"
	case "standard.txt":
		fileName = "standard.txt"
	case "shadow.txt":
		fileName = "shadow.txt"
	case "thinkertoy.txt":
		fileName = "thinkertoy.txt"
	default:
		fmt.Println("banner file not found in directory")
		return
	}

	if strings.HasPrefix(outputFlag, "--output=") {
		outputFile = strings.TrimPrefix(outputFlag, "--output=")
	}

	content, err := os.ReadFile("banner/" + fileName)
	if err != nil {
		fmt.Printf("Error reading bannerFile: %v\n", err)
		return
	}
	fileSplit := strings.Split(string(content), "\n")
	for _, ch := range theText {
		if ch < 32 || ch > 126 {
			fmt.Printf("Error: unsupported character: %q\n", ch)
			return
		}
	}
	finalOutput = DrawASCII(theText, fileSplit)

	if outputFile != "" {
		err := os.WriteFile(outputFile, []byte(finalOutput), 0644)
		if err != nil {
			fmt.Printf("Error writing outputFile: %v\n", err)
			return
		} else {
			fmt.Printf("Success! Proceesed %s into %s\n", fileName, outputFile)
		}
	} else {
		fmt.Print(finalOutput)
	}
}
