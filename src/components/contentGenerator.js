class ContentGenerator {
  constructor() {
    this.previousModuleInModuleInfoBox = null;
    this.previousModule = null;
    this.currentModule = null;
    this.main_container = document.getElementById("wrapper").querySelector(".relative.site_content.no-mood").querySelector(".row");
  }

  // Function to display module information
  displayModuleInfo(module) {
    const elements = document.querySelectorAll(".module-title");
    // Get previous Module in module List
    if (this.previousModuleInModuleInfoBox != null) {
      let previousModule = null;
      for (let i = 0; i < elements.length; i++) {
        if (elements[i].textContent.trim() === this.previousModuleInModuleInfoBox["Name"]) {
          previousModule = elements[i];
          break;
        }
      }
      this.previousModule = previousModule;
    }
    // Get current Module in module List
    let currentModule = null;
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].textContent.trim() === module["Name"]) {
        currentModule = elements[i];
        break;
      }
    }
    this.currentModule = currentModule;

    // Set display of info box to block if it is hidden and none if module is already displayed
    const infoBox = document.getElementById("module-info-container");
    if (this.previousModuleInModuleInfoBox === module && infoBox.style.display === "block") {
      this.previousModule.style.border = "none";
      infoBox.style.display = "none";
      return;
    }
    if (infoBox.style.display === "none" || infoBox.style.display === "") {
      if (this.previousModule != null) {
        this.previousModule.style.border = "none";
      }
      this.currentModule.style.borderBottom = "solid 1px black";
      infoBox.style.display = "block";
    }
    // Set content of info box to current module
    if (this.previousModule != null) {
      this.previousModule.style.border = "none";
    }
    this.currentModule.style.borderBottom = "solid 1px black";
    infoBox.innerHTML = `
      <em>Information zum Modul ${module["EventoIdentifier"]}</em>
      <br>
      ${module["Name"]}
      <br><br>
      <em>Modulverantwortlicher:</em>
      <br>${module["ModuleCoordinator"]}
      <br><br>
      <em>Sprache:</em> ${module["Language"]}
      <br><br>
      <em>Beschreibung:</em><br>${module["Description"] || "No description available."}
      `;
    this.previousModuleInModuleInfoBox = module;
  }

  createLoadingAnimation() {
    let parentElement = this.main_container;
  
    var loadingAnimation = document.createElement("div");
    loadingAnimation.id = "loading-animation";
  
    var loadingText = document.createElement("p");
    loadingText.id = "loading-text";
    loadingText.innerHTML = "Loading...";
  
    loadingAnimation.appendChild(loadingText);
  
    parentElement.appendChild(loadingAnimation);
  }

  clearView() {
    // Clear the loading-animation container
    let loadingAnimation = document.getElementById("loading-animation");
    if (loadingAnimation) {
      loadingAnimation.remove();
    }
  
    // Clear the timetableContainer container
    let timetableContainer = document.getElementById("timetable-container");
    if (timetableContainer) {
      timetableContainer.remove();
    }
  
    // Clear the filterInput container
    let filterInput = document.getElementById("filter-input");
    if (filterInput) {
      filterInput.remove();
    }

    // Clear module header container
    let moduleHeader = document.getElementById("module-header");
    if (moduleHeader) {
      moduleHeader.remove();
    }

    // Clear the modules container
    let modulesContainer = document.getElementById("modules-container");
    if (modulesContainer) {
      modulesContainer.remove();
    }

    // Clear module info container
    let moduleInfoContainer = document.getElementById("module-info-container");
    if (moduleInfoContainer) {
      moduleInfoContainer.remove();
    }
  
    // clear toggle description button
    let toggleDescription = document.getElementById("toggle-description-btn");
    if (toggleDescription) {
      toggleDescription.remove();
    }
  }

  generateModulesBySemester(modules) {
    // Clear the modules container
    let modulesContainer = document.getElementById("modules-container");
    if (modulesContainer) {
      modulesContainer.remove();
    }

    // let startElement = document.getElementById("intro");
    let startElement = this.main_container;

    // Create the filter input field
    let filterInput = document.getElementById("filter-input");
    if (filterInput) {
      filterInput.remove();
    }
    filterInput = document.createElement("input");
    filterInput.type = "text";
    filterInput.id = "filter-input";
    filterInput.placeholder = "Modul suchen";  // filter by identifier or name
    startElement.appendChild(filterInput);

    // Zustandsvariable für die Description-Suche
    let includeDescription = false;

    // Button für das Ein-/Ausschalten der Description-Suche erstellen
    let toggleDescriptionButton = document.createElement("button");
    toggleDescriptionButton.id = "toggle-description-btn";
    toggleDescriptionButton.textContent = "Volltextsuche: Aus";  // search in description
    startElement.appendChild(toggleDescriptionButton);

    // Event-Listener für den Button
    toggleDescriptionButton.addEventListener("click", () => {
      includeDescription = !includeDescription;
      this.filterModules(filterInput, modules, modulesContainer, includeDescription);
      toggleDescriptionButton.textContent = includeDescription ? "Volltextsuche: Ein" : "Volltextsuche: Aus";
      if (includeDescription) {
        toggleDescriptionButton.style.fontWeight = "bold";
      } else {
        toggleDescriptionButton.style.fontWeight = "normal";
      }
    });

    // Create the module header
    let moduleHeader = document.createElement("div");
    moduleHeader.id = "module-header";
    let moduleHeaderContent = document.createElement("table");
    let tableRow = document.createElement("tr");
    let rowContent1 = document.createElement("td");
    let rowContent2 = document.createElement("td");
    let rowContent3 = document.createElement("td");
    let rowContent4 = document.createElement("td");
    rowContent1.innerHTML = "Modul";
    rowContent2.innerHTML = "Durchführung";
    rowContent3.innerHTML = "Typ";
    rowContent4.innerHTML = "ECTS";
    rowContent1.classList.add("property-cell", "header-cell");
    rowContent2.classList.add("property-cell", "header-cell");
    rowContent3.classList.add("property-cell", "header-cell");
    rowContent4.classList.add("property-cell", "header-cell");
    rowContent1.style.width = "65%";
    rowContent2.style.width = "20%";
    rowContent3.style.width = "7%";
    rowContent4.style.width = "8%";
    tableRow.appendChild(rowContent1);
    tableRow.appendChild(rowContent2);
    tableRow.appendChild(rowContent3);
    tableRow.appendChild(rowContent4);
    moduleHeaderContent.appendChild(tableRow);
    moduleHeader.appendChild(moduleHeaderContent);
    startElement.appendChild(moduleHeader);

    // Create the modules container
    modulesContainer = document.createElement("div");
    modulesContainer.id = "modules-container";
    startElement.appendChild(modulesContainer);

    // Create Module Info container
    let moduleInfoContainer = document.createElement("div");
    moduleInfoContainer.id = "module-info-container";
    startElement.appendChild(moduleInfoContainer);

    // Add event listener to the filter input field
    filterInput.addEventListener("keyup", () => {
      this.filterModules(filterInput, modules, modulesContainer, includeDescription);
    });

    // Initial modules generation
    this.generateModules(modules, modulesContainer);
  }

  filterModules(filterInput, modules, modulesContainer, includeDescription) {
    let filterValue = filterInput.value.toLowerCase();

    // Filter the modules
    let filteredModules = modules.filter(
      (module) =>
        module["EventoIdentifier"].toLowerCase().includes(filterValue) ||
        module["Name"].toLowerCase().includes(filterValue) ||
        (includeDescription && module["Description"] && module["Description"].toLowerCase().includes(filterValue))
    );

    // Clear modules container
    modulesContainer.innerHTML = "";

    // Generate the modules using the filtered list
    this.generateModules(filteredModules, modulesContainer);
  }

  generateModules(modules, modulesContainer) {
    // Sort modules by name
    modules.sort((a, b) => a.Name.localeCompare(b.Name));

    // Mapping for ModuleType abbreviations
    const moduleTypeAbbreviations = {
      "Major-/Minormodul": "M",
      "Kernmodul": "K",
      "Zusatzmodul": "Z",
      "Erweiterungsmodul": "E",
      "Nicht definiert": "N/A",
      "Projektmodul": "P"
    };

    let contentWrapper = document.createElement("div");
    contentWrapper.classList.add("module-container");

    // Create a document fragment to build the table in memory (should speed up loading time)
    let fragment = document.createDocumentFragment();

    modules.forEach((module) => {
      let moduleElement = document.createElement("div");
      moduleElement.classList.add("module");

      // Add module properties in one row with multiple columns
      let propertyTable = document.createElement("table");
      propertyTable.classList.add("module-properties");

      let row = propertyTable.insertRow();

      // Add module title as the first cell in the row
      let titleCell = row.insertCell();
      let moduleTitle = document.createElement("h2");
      moduleTitle.classList.add("module-title");
      moduleTitle.innerText = `${module["Name"]}`;
      titleCell.appendChild(moduleTitle);

      // Add event listener to make the module clickable
      // Use arrow function to maintain the correct `this` context
      moduleElement.addEventListener("click", () => {
        this.displayModuleInfo(module);
      });

      // Find "ModuleType" in the correct location in your JSON
      const moduleType = module["ModuleOffers"]?.[0]?.["ModuleType"] || "N/A";

      // Conditionally exclude only "ExecutionType" value when it is "Wöchentlich"
      const propertyTitles = ["ExecutionType", "ModuleType", "Ects"];
      propertyTitles.forEach((property, index) => {
        if (!(property === "ExecutionType" && module[property] === "Wöchentlich")) {
          // Conditionally replace "ModuleType" value with abbreviation
          let cell = row.insertCell();
          cell.textContent = property === "ModuleType" ? moduleTypeAbbreviations[moduleType] || moduleType : Array.isArray(module[property]) ? module[property].join(', ') : module[property] || '';
          cell.classList.add("property-cell");
        }
      });

      moduleElement.append(propertyTable);
      fragment.appendChild(moduleElement);
    });

    // Append the document fragment to the actual DOM
    contentWrapper.appendChild(fragment);
    modulesContainer.appendChild(contentWrapper);
  }

  displayVisitedModules(visitedModules, averageGrade, totalCredits, creditsByType, ectsResult) {
    // Create a new container for modules visited
    let moduleVisitedContainer = document.createElement("div");
    moduleVisitedContainer.id = "modules-visited-container";

    // Gather necessary elements only once
    let semesterResults = document.getElementById("semester-results");
    let semesterCheckbox = document.getElementById("semester-checkbox");
    let semesterSelectValue = document.getElementById("semester-select").value;

    // Document fragment for efficient DOM manipulation
    let docFragment = document.createDocumentFragment();

    for (let visitedModule of visitedModules) {
      if (visitedModule.moduleName === undefined) {
        continue;
      }
      if (!semesterCheckbox.checked || visitedModule.semester === semesterSelectValue) {
        let moduleInfo = document.createElement("div");
        moduleInfo.classList.add("visited-module");
        moduleInfo.textContent = `Modul: ${visitedModule.moduleName}, Semester: ${visitedModule.semester}, Grad: ${visitedModule.grade}, ECTS: ${visitedModule.ects}, Note: ${visitedModule.note}`;
        docFragment.appendChild(moduleInfo);
      }
    }

    // Append all the visited modules at once
    moduleVisitedContainer.appendChild(docFragment);

    // Create and append stats element
    let statsElement = document.createElement("p");
    let noten_string;
    if (ectsResult !== null) {
        noten_string = `Notenschnitt: ${averageGrade} 
          <br>Ects Total: ${totalCredits} / ${ectsResult.TotalECTS}
          <br>Kernmodule: ${creditsByType.Kernmodule} / ${ectsResult.ectsPerModule.Kernmodule}
          <br>Projektmodule: ${creditsByType.Projektmodule} / ${ectsResult.ectsPerModule.Projektmodule}
          <br>Erweiterungsmodule: ${creditsByType.Erweiterungsmodule} / ${ectsResult.ectsPerModule.Erweiterungsmodule}
          <br>Zusatzmodule: ${creditsByType.Zusatzmodule} / ${ectsResult.ectsPerModule.Zusatzmodule}`;

          if (!(typeof ectsResult.ectsPerModule.Majormodule === 'undefined')) {
            noten_string += `<br>Majormodule: ${creditsByType.Major_Minormodule} / ${ectsResult.ectsPerModule.Majormodule}`;
          }
          if (!(typeof ectsResult.ectsPerModule.Minormodule === 'undefined')) {
            noten_string += `<br>Minormodule: ${creditsByType.Major_Minormodule} / ${ectsResult.ectsPerModule.Minormodule}`;
          }
    } else {
        noten_string = 'Unable to fetch ECTS from API because Study Programm is unknown.';
    }

    statsElement.innerHTML = noten_string;
    moduleVisitedContainer.appendChild(statsElement);

    // Replace the old container with the new one
    let oldContainer = document.getElementById("modules-visited-container");
    if (oldContainer) {
      semesterResults.replaceChild(moduleVisitedContainer, oldContainer);
    } else {
      semesterResults.appendChild(moduleVisitedContainer);
    }
  }

  displayTimetable(visitedModules) {
    // Clear the timetable
    let timetableContainer = document.getElementById("timetable-container");
    if (timetableContainer) {
      timetableContainer.remove();
    }

    timetableContainer = document.createElement("div");
    let startElement = this.main_container;

    timetableContainer.id = "timetable-container";
    startElement.appendChild(timetableContainer);

    let timetable = {
      Montag: [],
      Dienstag: [],
      Mittwoch: [],
      Donnerstag: [],
      Freitag: [],
      Samstag: [],
      Sonntag: [],
    };

    let semesterSelect = document.getElementById("semester-select");

    visitedModules.forEach((module) => {
      const pattern = /^[A-Za-z]{2}\/\d{2}:\d{2}\/\d{2}:\d{2}$/; // Pattern for the time format
      if (module.semester === semesterSelect.value)
        if (module.durchfuehrung !== null){
          if (Array.isArray(module.durchfuehrung)) {
            module.durchfuehrung.forEach((time) => {
              if (pattern.test(time)) { // Check if the module.durchfuehrung is in the correct time format
                let [day, startTime, endTime] = time.split("/");
                day = this.convertDay(day);
                timetable[day].push({
                  moduleName: module.moduleName,
                  startTime,
                  endTime,
                });
              }
            });
          } else if (pattern.test(module.durchfuehrung)) {
            let [day, startTime, endTime] = module.durchfuehrung.split("/");
            day = this.convertDay(day);
            timetable[day].push({
              moduleName: module.moduleName,
              startTime,
              endTime,
            });
          }
        }
    });

    let timetableHTML = "";

    for (let day in timetable) {
      if (timetable[day].length > 0) {
        timetableHTML += `<h2>${day}</h2>`;
        timetable[day].forEach((slot) => {
          timetableHTML += `<div>${slot.moduleName}: ${slot.startTime} - ${slot.endTime}</div>`;
        });
      }
    }

    timetableContainer.innerHTML = timetableHTML;
  }

  convertDay(day) {
    const daysMap = { Mo: "Montag", Di: "Dienstag", Mi: "Mittwoch", Do: "Donnerstag", Fr: "Freitag", Sa: "Samstag", So: "Sonntag" };
    return daysMap[day] || "";
  }
}
