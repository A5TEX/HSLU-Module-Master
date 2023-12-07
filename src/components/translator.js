// Translator Class

class Translator {
    constructor() {
        // Define your dictionary
        this.germanToEnglish = {
          "Hallo": "Hello",
          "ECTS-Punkte": "ECTS-Points",
          "Modultypen Übersicht": "Module type summary",
          "Noten": "Mark",
          "Modulübersicht": "Summary of modules",
          "Modul-Name": "Module name",
          "Modul-Typ": "Module type",
          "Bewertung": "Evaluation",
          "Grad": "Grade",
          "Anzahl": "Quantity",
          "Verteilung": "Distribution",
          "*Majormodule sind spezielle Erweiterungsmodule. Falls alle 24 ECTS eines Majors erreicht wurden, erhält man diesen.": "*Majorsmodules are a kinde of extensionmodules. If you got all 24 ETCS of a major, you get rewarded with a fancy title",
          "Majormodul": "Major module",
          "Kernmodul": "Core module",
          "Projektmodul": "Project module",
          "Zusatzmodul": "Additional module",
          "Erweiterungsmodul": "Extension module",
          "Bestanden": "Passed",
          "Extension wird geladen": "Loading extension",
          "Name": "Name",
          "Jahr": "Year",
          "Semester": "Semester",
          "Note": "Mark",
          "[ 0 ] für keine Bewertung:": "[ 0 ] for no evaluation:",
          "[ - ] für keinen Grad": "[ - ] for no grade",
          "Herbst": "Autumn",
          "Frühling": "Spring",
          "Modul hinzufügen": "Add module",
          "Modul entfernen": "Remove module",
          "Speichern": "Save",
          "Entfernen": "Remove"
        };

        this.englishToGerman = {
          "Hello": "Hallo",
          "ECTS-Points": "ECTS-Punkte",
          "Module type summary": "Modultypen Übersicht",
          "Mark": "Noten",
          "Summary of modules": "Modulübersicht",
          "Module name": "Modul-Name",
          "Module type": "Modul-Typ",
          "Evaluation": "Bewertung",
          "Grade": "Grad",
          "Quantity": "Anzahl",
          "Distribution": "Verteilung",
          "*Majormodules are a kind of extensionmodules. If you got all 24 ETCS of a major, you get rewarded with a fancy title": "*Majormodule sind spezielle Erweiterungsmodule. Falls alle 24 ECTS eines Majors erreicht wurden, erhält man diesen.",
          "Major module": "Majormodul",
          "Core module": "Kernmodul",
          "Project module": "Projektmodul",
          "Additional module": "Zusatzmodul",
          "Extension module": "Erweiterungsmodul",
          "Passed": "Bestanden",
          "Loading extension": "Extension wird geladen",
          "Name": "Name",
          "Year": "Jahr",
          "Semester": "Semester",
          "Mark": "Note",
          "[ 0 ] for no evaluation:": "[ 0 ] für keine Bewertung:",
          "[ - ] for no grade": "[ - ] für keinen Grad",
          "Autumn": "Herbst",
          "Spring": "Frühling",
          "Add module": "Modul hinzufügen",
          "Remove module": "Modul entfernen",
          "Save": "Speichern",
          "Remove": "Entfernen"
        };
    }
    
    translateToEnglish (string_to_translate) {
      const germanWord = string_to_translate;
      if (this.germanToEnglish.hasOwnProperty(germanWord)) {
        return this.germanToEnglish[germanWord];
      } else {
        return "Translation not found";
      }
    }
  
    translateToGerman (string_to_translate) {
      const englishWord = string_to_translate;
      if (this.englishToGerman.hasOwnProperty(englishWord)) {
        return this.englishToGerman[englishWord];
      } else {
        return "Translation not found";
      }
    }

    translate (language, string_to_translate) {
      if (language === "German") {
        return this.translateToEnglish(string_to_translate);
      } else if (language === "English") {
        return this.translateToGerman(string_to_translate);
      } else {
        return "Unsupported language";
      }
    }

  }


// const translator = new Translator();
// console.log(translator.translateToEnglish("Hallo")); // Output: "hello"
// 
// console.log("hello");   
