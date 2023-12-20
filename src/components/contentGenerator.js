/**
 * `ContentGenerator` is a class responsible for generating and managing content on the MyCampus webpage.
 * It keeps track of various modules, their types, and their relationships.
 * It also has the ability to create new HTML elements and append them to the main container on the webpage.
 *
 * @property {HTMLElement} previousModuleInModuleInfoBox - The last module in the info box.
 * @property {Array} visitedModules - An array of modules that have been visited.
 * @property {HTMLElement} previousModule - The last visited module.
 * @property {HTMLElement} currentModule - The current module.
 * @property {Array} moduleTypeFilter - An array to filter modules by type.
 * @property {Object} moduleTypeAbbreviations - An object mapping module types to their abbreviations.
 * @property {HTMLElement} main_container - The main container on the webpage.
 * @property {HTMLElement} moduleMasterContainer - The master container for all selected modules.
 */
class ContentGenerator {
  constructor() {
    this.previousModuleInModuleInfoBox = null;
    this.visitedModules = [];
    this.previousModule = null;
    this.currentModule = null;
    this.moduleTypeFilter = [];
    this.moduleTypeAbbreviations = {
      "Major-/Minormodul": "M",
      "Kernmodul": "K",
      "Zusatzmodul": "Z",
      "Erweiterungsmodul": "E",
      "Nicht definiert": "-",
      "Projektmodul": "P"
    };
    this.main_container = document.querySelector("#wrapper .relative.site_content.no-mood .row");

    // Create the moduleMasterContainer instance
    this.moduleMasterContainer = this.createElement('div', 'module-master-container');

    // Append to the main container
    this.main_container.appendChild(this.moduleMasterContainer);
  }

  /**
   * Creates a new HTML element of the specified type and with the specified id.
   *
   * This method creates a new HTML element of the given type using the document.createElement method.
   * It then sets the id of the element to the given id.
   * Finally, it returns the created element.
   *
   * @param {string} elementType - The type of the element to create.
   * @param {string} id - The id to set for the element.
   * @returns {HTMLElement} The created element.
   */
  createElement(elementType, id) {
    const element = document.createElement(elementType);
    element.id = id;
    return element;
  }

  /**
   * Displays information about a module in an info box.
   *
   * This method first gets all elements with the class 'module-title'.
   * It then finds the previous module in the module list and the current module in the module list by comparing the text content of the elements with the 'Name' property of the previous and current modules.
   * It then gets the info box element by its id.
   * If the previous module is the same as the current module and the info box is currently displayed, it hides the info box and removes the border from the previous module.
   * If the info box is currently hidden, it displays the info box, removes the border from the previous module if it exists, and adds a border to the bottom of the current module.
   * It then sets the content of the info box to the information of the current module, removes the border from the previous module if it exists, and adds a border to the bottom of the current module.
   * Finally, it sets the previous module in the module info box to the current module.
   *
   * @param {Object} module - The module for which to display information.
   */
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

  /**
   * Creates a loading animation and appends it to the main container.
   *
   * This method first gets the main container element.
   * It then creates a new div element for the loading animation and assigns it an id of 'loading-animation'.
   * It also creates a new p element for the loading text, assigns it an id of 'loading-text', and sets its inner HTML to 'Loading...'.
   * It appends the loading text to the loading animation.
   * Finally, it appends the loading animation to the main container.
   */
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

  /**
   * Clears the view by removing various elements from the DOM.
   *
   * This method gets each element by its id, including the loading animation, timetable container, filter input, module header, modules container, module type button group, semantic filter button group, and module info container.
   * If an element exists, it removes it from the DOM.
   * This effectively clears the view, preparing it for new content.
   */
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

    // Clear module type button group
    let moduleTypeButtonGroup = document.getElementById("module-type-btn-group");
    if (moduleTypeButtonGroup) {
      moduleTypeButtonGroup.remove();
    }

    // Clear module type button group
    let semanticFilterButtonGroup = document.getElementById("semantic-filter-btn-group");
    if (semanticFilterButtonGroup) {
      semanticFilterButtonGroup.remove();
    }

    // Clear module info container
    let moduleInfoContainer = document.getElementById("module-info-container");
    if (moduleInfoContainer) {
      moduleInfoContainer.remove();
    }
  }

  /**
   * Generates a list of modules by semester, along with a set of filters.
   *
   * This method first clears the modules container and creates a new filter input field.
   * It then creates a button group for semantic filters, including a button to toggle full-text search and a button to recommend modules.
   * It also creates a button group for module type filters, with a button for each module type abbreviation.
   * It then creates a module header with a table layout.
   * It also creates a new modules container and a module info container.
   * It adds an event listener to the filter input field to filter modules whenever the input changes.
   * Finally, it generates the initial list of modules.
   *
   * @param {Array} modules - The list of modules to generate.
   * @param {Object} studyProgram - The study program for which to generate modules.
   * @param {Array} visitedModules - The list of modules visited by the student.
   */
  generateModulesBySemester(modules, studyProgram, visitedModules) {
    let moduleTypeFilter = this.moduleTypeFilter;
    this.visitedModules = visitedModules;
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
    // Zustandsvariable für die Modul-Empfehlung
    let recommendModules = false;

    let semanticFilterButtonGroup = document.createElement("div");
    semanticFilterButtonGroup.id = "semantic-filter-btn-group";

    // Button für das Ein-/Ausschalten der Description-Suche erstellen
    let toggleDescriptionButton = document.createElement("button");
    toggleDescriptionButton.id = "toggle-description-btn";
    toggleDescriptionButton.classList.add("FilterButton");
    toggleDescriptionButton.textContent = "Volltextsuche";  // search in description
    // Event-Listener für den Button
    toggleDescriptionButton.addEventListener("click", () => {
      includeDescription = !includeDescription;
      this.filterModules(filterInput, modules, modulesContainer, includeDescription, studyProgram, moduleTypeFilter, recommendModules);
      if (includeDescription) {
        toggleDescriptionButton.style.fontWeight = "bold";
      } else {
        toggleDescriptionButton.style.fontWeight = "normal";
      }
    });
    semanticFilterButtonGroup.appendChild(toggleDescriptionButton);

    let recommendedModuleButton = document.createElement("button");
    recommendedModuleButton.id = "recommended-module-btn";
    recommendedModuleButton.classList.add("FilterButton");
    recommendedModuleButton.textContent = "Module empfehlen";

    recommendedModuleButton.addEventListener("click", () => {
      recommendModules = !recommendModules;
      this.filterModules(filterInput, modules, modulesContainer, includeDescription, studyProgram, moduleTypeFilter, recommendModules);
      if (recommendModules) {
        recommendedModuleButton.style.fontWeight = "bold";
      } else {
        recommendedModuleButton.style.fontWeight = "normal";
      }
    });
    semanticFilterButtonGroup.appendChild(recommendedModuleButton);
    startElement.appendChild(semanticFilterButtonGroup);

    let moduleTypeButtonGroup = document.createElement("div");
    moduleTypeButtonGroup.id = "module-type-btn-group";
    // Create buttons for each module type abbreviation
    for (const abbreviation in this.moduleTypeAbbreviations) {
      let button = document.createElement("button");
      button.textContent = abbreviation;
      button.classList.add("FilterButton");
      // Add event listener to filter modules by module type
      button.addEventListener("click", () => {
        // add or remove module type from filter
        if (moduleTypeFilter.includes(abbreviation)) {
          moduleTypeFilter = moduleTypeFilter.filter((type) => type !== abbreviation);
          button.style.fontWeight = "normal";
        } else {
          moduleTypeFilter.push(abbreviation);
          button.style.fontWeight = "bold";
        }
        this.filterModules(filterInput, modules, modulesContainer, includeDescription, studyProgram, moduleTypeFilter, recommendModules);
      });
      moduleTypeButtonGroup.appendChild(button);
    }
    startElement.append(moduleTypeButtonGroup);

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
      this.filterModules(filterInput, modules, modulesContainer, includeDescription, studyProgram, moduleTypeFilter, recommendModules);
    });

    // Initial modules generation
    this.generateModules(modules, modulesContainer, studyProgram);
  }

  /**
   * Finds the correct module type for a given module and study program.
   *
   * This method first defines a mapping of study program abbreviations to their full names.
   * It then initializes the module type to 'Nicht definiert'.
   * It iterates over the module offers of the given module.
   * For each offer, if the degree programme of the offer matches the full name of the study program, it sets the module type to the module type of the offer and breaks the loop.
   * It then returns the module type.
   *
   * @param {Object} module - The module for which to find the module type.
   * @param {string} studyProgram - The abbreviation of the study program for which to find the module type.
   * @returns {string} The module type for the given module and study program, or 'Nicht definiert' if no matching offer is found.
   */
  findCorrectModuleType(module, studyProgram) {
    const studyProgramAbbreviations = {
      "I": "Informatik",
      "WI": "Wirtschaftsinformatik",
      "ICS": "Information & Cyber Security",
      "AIML": "Artificial Intelligence & Machine Learning",
      "DI": "Digital Ideation"
    };
    // Find Correct ModuleType according to studyProgram
    let moduleType = "Nicht definiert";
    for (let offer of module["ModuleOffers"]) {
      if (offer["DegreeProgramme"] === studyProgramAbbreviations[studyProgram]) {
        moduleType = offer["ModuleType"];
        break;
      }
    }

    return moduleType;
  }

  /**
   * Filters the list of modules based on various criteria and generates the filtered list of modules.
   *
   * This method first gets the names of all visited modules.
   * It then finds all complementary modules that have a match in the visited modules.
   * It also gets the value of the filter input field and converts it to lower case.
   * It then filters the modules based on whether the module type matches the module type filter, and whether the module's EventoIdentifier, Name, or Description (if included) contains the filter value.
   * If the recommendModules flag is true, it also checks whether the module is a complementary module and has not been visited.
   * It then clears the modules container and generates the filtered list of modules.
   *
   * @param {HTMLInputElement} filterInput - The filter input field.
   * @param {Array} modules - The list of modules to filter.
   * @param {HTMLElement} modulesContainer - The container for the modules.
   * @param {boolean} includeDescription - Whether to include the module description in the filter.
   * @param {string} studyProgram - The abbreviation of the study program for which to filter modules.
   * @param {Array} moduleTypeFilter - The list of module types to include in the filter.
   * @param {boolean} recommendModules - Whether to recommend modules based on the visited modules.
   */
  filterModules(filterInput, modules, modulesContainer, includeDescription, studyProgram, moduleTypeFilter, recommendModules) {
    // Get All moduleName from visitedModules
    let visitedModulesName = [];
    for (let visitedModule of this.visitedModules) {
      visitedModulesName.push(visitedModule.moduleName);
    }

    // Add all the modules ComplementaryModules toghether which have a match in visitedModulesName with the EventoIdentifier
    let complementaryModules = [];
    for (let module of modules) {
      // Check if eventoIfentifier contains a visitedModulesName
      if (visitedModulesName.some(visitedModuleName => module["EventoIdentifier"].includes(visitedModuleName))) {
        for (let complementaryModule of module["ComplementaryModules"]) {
          if (!complementaryModules.includes(complementaryModule)) {
            complementaryModules.push(complementaryModule);
          }
        }
      }
    }

    let filterValue = filterInput.value.toLowerCase();

    let filteredModules = modules.filter((module) => {
      // Common filter conditions
      let isModuleTypeMatched = moduleTypeFilter.length === 0 || moduleTypeFilter.includes(this.findCorrectModuleType(module, studyProgram));
      let isFilterValueMatched = module["EventoIdentifier"].toLowerCase().includes(filterValue) ||
        module["Name"].toLowerCase().includes(filterValue) ||
        (includeDescription && module["Description"] && module["Description"].toLowerCase().includes(filterValue));

      if (recommendModules) {
        // Specific condition for recommendModules
        return complementaryModules.includes(module["Name"]) &&
          !visitedModulesName.some(visitedModuleName => module["EventoIdentifier"].includes(visitedModuleName)) &&
          isModuleTypeMatched &&
          isFilterValueMatched;
      } else {
        // Apply common filter conditions only
        return isModuleTypeMatched && isFilterValueMatched;
      }
    });

    // Clear modules container
    modulesContainer.innerHTML = "";

    // Generate the modules using the filtered list
    this.generateModules(filteredModules, modulesContainer, studyProgram);
  }

  /**
   * Generates a list of modules and appends it to the modules container.
   *
   * This method first sorts the modules by name.
   * It then creates a new div element for the modules container and a document fragment to build the table in memory.
   * It iterates over the modules, creating a new div element for each module and a table for the module properties.
   * It adds the module title as the first cell in the row and adds an event listener to make the module clickable.
   * It finds the correct module type according to the study program and replaces 'Nicht definiert' with '-'.
   * It then iterates over the property titles, excluding 'ExecutionType' when its value is 'Wöchentlich'.
   * It replaces 'ModuleType' with its abbreviation and joins array values with ', '.
   * It then appends the property table to the module element and the module element to the document fragment.
   * Finally, it appends the document fragment to the modules container.
   *
   * @param {Array} modules - The list of modules to generate.
   * @param {HTMLElement} modulesContainer - The container for the modules.
   * @param {string} studyProgram - The abbreviation of the study program for which to generate modules.
   */
  generateModules(modules, modulesContainer, studyProgram) {
    // Sort modules by name
    modules.sort((a, b) => a.Name.localeCompare(b.Name));

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

      // Find Correct ModuleType according to studyProgram
      let moduleType = this.findCorrectModuleType(module, studyProgram);
      if (moduleType === "Nicht definiert") {
        moduleType = "-";
      }

      // Conditionally exclude only "ExecutionType" value when it is "Wöchentlich"
      const propertyTitles = ["ExecutionType", "ModuleType", "Ects"];
      propertyTitles.forEach((property, index) => {
        if (!(property === "ExecutionType" && module[property] === "Wöchentlich")) {
          // Conditionally replace "ModuleType" value with abbreviation
          let cell = row.insertCell();
          if (property === "ModuleType") {
            cell.textContent = this.moduleTypeAbbreviations[moduleType] || moduleType;
          } else if (Array.isArray(module[property])) {
            cell.textContent = module[property].join(', ');
          } else {
            cell.textContent = module[property] || '';
          }
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

  /**
   * Displays a timetable of visited modules for the selected semester.
   *
   * This method first clears the timetable container if it exists and creates a new one.
   * It then initializes an empty timetable with arrays for each day of the week.
   * It gets the selected semester from the semester select element.
   * It iterates over the visited modules, checking if the module's semester matches the selected semester and if the module has a durchfuehrung property.
   * If the durchfuehrung property is an array, it iterates over the array, checking if each time is in the correct format.
   * If the time is in the correct format, it splits the time into day, start time, and end time, converts the day to the correct format, and adds a new slot to the timetable for the day with the module name, start time, and end time.
   * If the durchfuehrung property is not an array but is in the correct format, it does the same for the single time.
   * It then generates the HTML for the timetable, creating a heading for each day with slots and a div for each slot with the module name and start and end times.
   * Finally, it sets the inner HTML of the timetable container to the generated HTML.
   *
   * @param {Array} visitedModules - The list of visited modules.
   */
  displayTimetable(visitedModules) {
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
        if (module.durchfuehrung !== null) {
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

  /**
   * Converts a day abbreviation to its full name in German.
   *
   * This method defines a mapping of day abbreviations to their full names in German.
   * It then returns the full name corresponding to the given abbreviation, or an empty string if the abbreviation is not recognized.
   *
   * @param {string} day - The day abbreviation to convert.
   * @returns {string} The full name of the day in German, or an empty string if the abbreviation is not recognized.
   */
  convertDay(day) {
    const daysMap = { Mo: "Montag", Di: "Dienstag", Mi: "Mittwoch", Do: "Donnerstag", Fr: "Freitag", Sa: "Samstag", So: "Sonntag" };
    return daysMap[day] || "";
  }

  /**
   * Displays a detailed overview of visited modules, including progress bars for each module type and a table of modules.
   *
   * This method first creates a link to the Tailwind CSS stylesheet and appends it to the head of the document.
   * It then creates a new container for the module master and appends it to the main container.
   * It iterates over the module types, creating a section for each type with a title, progress information, and a progress bar.
   * It calculates the progress as the number of obtained ECTS credits divided by the number of required ECTS credits for the module type.
   * If the module type is 'Zusatzmodule', it also creates a container for general information and a row for the average grade.
   * It then filters the visited modules for the current module type and creates a table of these modules.
   * It appends the table to the module type section and the section to the module master container.
   * If the module type is 'Zusatzmodule', it also appends the general information container to the module master container.
   *
   * @param {Array} visitedModules - The list of visited modules.
   * @param {number} averageGrade - The average grade of the visited modules.
   * @param {number} ectsObtainedTotal - The total number of ECTS credits obtained.
   * @param {Object} creditsByType - An object mapping module types to the number of ECTS credits obtained for that type.
   * @param {Object} ectsResult_from_API - An object containing the number of required ECTS credits for each module type.
   * @param {string} studyProgram - The abbreviation of the study program for which to display the module master.
   */
  displayModuleMaster(visitedModules, averageGrade, ectsObtainedTotal, creditsByType, ectsResult_from_API, studyProgram) {

    // Function to create a link element for Tailwind CSS stylesheet
    function createTailwindCSSLink() {
      const link = document.createElement('link');
      link.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
      link.rel = 'stylesheet';
      return link;
    }

    // Get the head element of the document
    const head = document.head || document.getElementsByTagName('head')[0];

    // Create the link element and append it to the head
    head.appendChild(createTailwindCSSLink());

    // Create a new container for module master
    const moduleMasterContainer = document.createElement('div');
    moduleMasterContainer.id = 'module-master-container';
    moduleMasterContainer.classList.add('container', 'mx-auto', 'p-6');

    // Clear existing content in the module master container
    moduleMasterContainer.innerHTML = '';

    // Append the module master container to the main container
    this.main_container.appendChild(moduleMasterContainer);

    let generalInfoContainer;
    // Iterate over module types and create sections for each type
    Object.keys(creditsByType).forEach((moduleType) => {

      // Create a section for the module type
      const moduleTypeSection = document.createElement('div');
      moduleTypeSection.classList.add('container', 'mx-auto', 'p-6');

      // Display module type title
      const moduleTypeTitle = document.createElement('h1');
      moduleTypeTitle.classList.add('text-2xl', 'font-bold', 'mb-4');
      if (moduleType === 'Majormodule') {
        moduleType = 'Major-/Minormodule';
      }
      moduleTypeTitle.textContent = moduleType;
      moduleTypeSection.appendChild(moduleTypeTitle);

      // Display progress information
      const progressInfo = document.createElement('div');
      progressInfo.classList.add('text-green-500', 'font-bold');

      if (moduleType === 'Major-/Minormodule'){
        if (studyProgram === 'AIML') {
            moduleType = 'Minormodule';
        } else {
            moduleType = 'Majormodule';
        }
      }
      const requiredEcts = parseInt(ectsResult_from_API.ectsPerModule[moduleType]);
      if (moduleType === 'Minormodule') {
        moduleType = 'Majormodule';
      }
      const obtainedEcts = creditsByType[moduleType];
      const progressInfoValue = `${obtainedEcts} / ${requiredEcts}`;
      progressInfo.textContent = progressInfoValue;
      moduleTypeSection.appendChild(progressInfo);
      if (moduleType === 'Majormodule'){
        moduleType = 'Major-/Minormodule';
      }

      // Display progress bar
      const progressBarContainer = document.createElement('div');
      progressBarContainer.classList.add('flex', 'justify-between', 'items-center', 'mb-2');
      const progressBar = document.createElement('div');
      progressBar.classList.add('w-full', 'bg-gray-300', 'rounded-full', 'h-2.5', 'dark:bg-gray-700');
      const progressBarFill = document.createElement('div');
      progressBarFill.classList.add('bg-green-500', 'h-2.5', 'rounded-full');
      const progressWidth = (obtainedEcts / requiredEcts) * 100;
      progressBarFill.style.width = isNaN(progressWidth) ? '0%' : `${progressWidth}%`;
      progressBar.appendChild(progressBarFill);
      progressBarContainer.appendChild(progressBar);
      moduleTypeSection.appendChild(progressBarContainer);

      if (moduleType === 'Zusatzmodule') {
        // Create a new container for general information
        generalInfoContainer = document.createElement('div');
        generalInfoContainer.classList.add('container', 'mx-auto', 'p-6');

        // Create a new row for average grade
        const averageGradeRow = document.createElement('div');
        averageGradeRow.classList.add('flex', 'justify-between', 'items-center', 'mb-2');

        const averageGradeLabel = document.createElement('div');
        averageGradeLabel.classList.add('text-black-500', 'font-bold');
        averageGradeLabel.textContent = 'Notenschnitt:';

        const averageGradeValue = document.createElement('div');
        const roundedAverageGrade = parseFloat(averageGrade).toFixed(2);
        averageGradeValue.textContent = `${roundedAverageGrade}`;

        averageGradeRow.appendChild(averageGradeLabel);
        averageGradeRow.appendChild(averageGradeValue);

        generalInfoContainer.appendChild(averageGradeRow);
      }

      // Display tables for different module types
      const modulesForCurrentType = visitedModules.filter(module => {
        return module.moduleType + 'e' === moduleType || module.moduleType === moduleType;
      });

      // Display tables for the corresponding module type
      const moduleTable = this.createModuleTable(moduleType, modulesForCurrentType);

      // Append the table to the module type section
      moduleTypeSection.appendChild(moduleTable);

      // Append the module type section to the container
      this.moduleMasterContainer.appendChild(moduleTypeSection);

      // Append the general info container to the container
      if (moduleType === 'Zusatzmodule') {
        this.moduleMasterContainer.appendChild(generalInfoContainer);
      }
    });
  }

  /**
   * Creates a table of visited modules for a given module type.
   *
   * This method first creates an empty table and extracts and sorts the semesters from the visited modules.
   * It then creates a table header with a cell for the module type and a cell for each semester, and a table body with a row for each module.
   * Each row contains a cell for the module name, a cell for the ECTS credits for each semester, and a cell for the grade.
   * The grade is formatted to two decimal places if it is a number and is not zero, otherwise it is set to '0'.
   * The table, table header, and table body are created using helper functions defined within this method.
   * The table is then returned.
   *
   * @param {string} moduleType - The type of the modules to include in the table.
   * @param {Array} visitedModules - The list of visited modules.
   * @returns {HTMLTableElement} The created table.
   */
  createModuleTable(moduleType, visitedModules) {

    const table = createTable();
    const semesters = extractAndSortSemesters(visitedModules);
    const thead = createTableHeader(moduleType, semesters);
    const tbody = createTableBody(moduleType, visitedModules, semesters);


    table.appendChild(thead);
    table.appendChild(tbody);

    return table;

    function createTable() {
      const table = document.createElement('table');
      table.classList.add('border-collapse', 'table-auto', 'w-full', 'whitespace-no-wrap', 'bg-white', 'table-striped', 'relative');
      return table;
    }

    function extractAndSortSemesters(modules) {
      const semestersSet = new Set(modules.map((module) => module.semester));
      return [...semestersSet].sort((a, b) => {
        const yearA = parseInt(a.slice(1));
        const yearB = parseInt(b.slice(1));

        if (yearA !== yearB) {
          return yearA - yearB;
        }

        const termA = a.charAt(0);
        const termB = b.charAt(0);

        if (termA === termB) {
          return 0;
        } else if (termA === 'H') {
          return -1;
        } else {
          return 1;
        }
      });
    }

    function createTableHeader(moduleType, semesters) {
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');

      const headerAssessmentstufe = createTableHeaderCell(moduleType, 'bg-gray-100', 'sticky', 'top-0', 'p-2', 'w-1/3', 'text-left');
      headerRow.appendChild(headerAssessmentstufe);

      semesters.forEach((semester) => {
        const headerSemester = createTableHeaderCell(semester, 'bg-gray-100', 'sticky', 'top-0', 'p-2', 'text-left');
        headerRow.appendChild(headerSemester);
      });

      const headerNote = createTableHeaderCell('Note', 'bg-gray-100', 'sticky', 'top-0', 'p-2', 'text-left');
      headerRow.appendChild(headerNote);

      thead.appendChild(headerRow);

      return thead;
    }

    function createTableHeaderCell(text, ...classes) {
      const cell = document.createElement('th');
      cell.textContent = text;
      cell.classList.add(...classes);
      return cell;
    }

    function createTableBody(moduleType, visitedModules, semesters) {
      const tbody = document.createElement('tbody');

      visitedModules.forEach((module) => {
        const row = document.createElement('tr');

        const moduleNameCell = createTableCell(module.moduleName, 'p-2');
        row.appendChild(moduleNameCell);

        semesters.forEach((semester) => {
          const ectsButtonCell = createTableCell(
            module.semester === semester ? module.ects.toString() : '0',
            'p-2'
          );
          row.appendChild(ectsButtonCell);
        });

        const noteColumnCell = createTableCell(
          (() => {
            let note = parseFloat(module.note);
            if (!isNaN(note) && note !== 0) {
              return note.toFixed(2);
            } else if (typeof module.note === 'string' && !isNaN(parseFloat(module.note))) {
              note = parseFloat(module.note);
              if (note !== 0) {
                return note.toFixed(2);
              }
            }
            return '0';
          })(),
          'p-2'
        );

        row.appendChild(noteColumnCell);

        tbody.appendChild(row);
      });

      return tbody;
    }

    function createTableCell(text, ...classes) {
      const cell = document.createElement('td');
      cell.textContent = text;
      cell.classList.add(...classes);
      return cell;
    }
  }
}