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
		fmt.Println("Usage: go run . [OPTION] [STRING] [BANNER]")	
		return
	}


switch bannerName {
case "standard":
	fileName = "standard.txt"
case "shadow":
	fileName = "shadow.txt"
case "thinkertoy":
	fileName = "thinkertoy.txt"
default:
	fmt.Println("file not found in directory")	
	return	
}


if strings.HasPrefix(outputFlag, "--output=") {
		outputFile = strings.TrimPrefix(outputFlag, "--output=")
	}

content, err := os.ReadFile(fileName)	
if err != nil {
	fmt.Println("file not present")
	return
}
fileSplit := strings.Split(string(content), "\n")

finalOutput = DrawASCII(theText, fileSplit)

if outputFile != "" {
err := os.WriteFile(outputFile, []byte(finalOutput), 0644)
if err != nil{
	fmt.Printf("Error writing outputFile: %v\n", err)
	return
} else {
	fmt.Printf("Success! Proceesed %s into %s\n", fileName, outputFile)
}
} else {
	fmt.Print(finalOutput)
}
}




