/**
 * The DataExtractor class serves as a comprehensive solution for retrieving, processing, and storing academic data related to modules and students within a university context. This class interfaces with a specified API to fetch module data, including events and ECTS requirements, and handles student-specific data, such as academic progress and study schedule. 
 * 
 * It is capable of fetching data from an external API, parsing module information for specific semesters, saving and retrieving student data from local browser storage, and performing various calculations and transformations on the data. The class is designed to work with different browsers and manages data for different study programs, making it a versatile tool for academic data management in web applications.
 * 
 * The class also includes private methods for fetching data from the API, saving and retrieving data to and from the browser's local storage, and manipulating this data to provide insights such as the start date of study periods, semester determination from dates, and detailed module information including type and execution schedule.
 * 
 * @property {String} api_url - The base URL for the API from which the class fetches data.
 * @property {String} access_key - An access key used for authenticating requests to the API.
 */
class DataExtractor {

    constructor(api_url, access_key) {
        this.api_url = api_url;
        this.access_key = access_key;
    }


/**
 * ============================================================
 * 
 * Start of Private methods.
 * 
 * ============================================================
 */

    /**
     * This function fetches data from the API.
     * It first creates a Headers object and appends the access key to it.
     * It then sends a GET request to the API using the Fetch API, appending the input URL end to the base API URL and including the headers.
     * If the response is not OK (status code is not in the range 200-299), it throws an error with the status code.
     * If the response is OK, it parses the response body as JSON and returns the resulting data.
     * If any error occurs during this process, it returns null.
     * 
     * @param {String} url_end - The end of the URL to fetch from the API.
     * @returns {Object|null} The data fetched from the API, or null if an error occurred.
     */
    async _fetchData_API(url_end) {
        try {
            const headers = new Headers();
            headers.append('X-Access-Key', this.access_key);
            let response = await fetch(this.api_url + url_end, { headers });
           if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }
            let data = await response.json();
            return data;
        } catch (error) {
            return null;
        }
    }

    /**
     * This function retrieves module data for a specific semester from the API.
     * It first constructs the API path by appending the semester to the '/modules/' path.
     * It then calls the _fetchData_API() function with this path to fetch the data.
     * If the fetched data is null, it returns null.
     * Otherwise, it returns the 'result' property of the fetched data.
     * 
     * @param {String} semester - The semester for which to retrieve module data.
     * @returns {Object|null} The module data for the semester, or null if no data was fetched.
     */
    async _get_data_by_semester(semester) {
        let path = '/modules/' + semester;
        let data = await this._fetchData_API(path);
        if (data === null) {
            return null;
        }
        return data['result'];
    }

    /**
     * This function saves an object to the browser's local storage.
     * It first checks if the 'browser' object and 'browser.storage' are defined, which indicates that the browser is Firefox.
     * If so, it calls the _save_to_localstorage_firefox() function to save the object.
     * If 'browser' and 'browser.storage' are not defined, it checks if the 'chrome' object and 'chrome.storage' are defined, which indicates that the browser is Chrome.
     * If so, it calls the _save_to_localstorage_chrome() function to save the object.
     * If neither 'browser.storage' nor 'chrome.storage' are defined, it throws an error indicating that the browser is unsupported.
     * 
     * @param {Object} obj - The object to save to local storage.
     * @param {String} itemID - The ID to use for the object in local storage.
     * @returns {Promise} A Promise that resolves when the object has been saved to local storage.
     * @throws {Error} If the browser is not supported.
     */
    async _save_to_localstorage(obj, itemID) {
        if (typeof browser !== 'undefined' && browser.storage) {
            // Firefox
            return this._save_to_localstorage_firefox(obj, itemID);
        } else if (typeof chrome !== 'undefined' && chrome.storage) {
            // Chrome
            return this._save_to_localstorage_chrome(obj, itemID);
        } else {
            throw new Error('Unsupported browser');
        }
    }

    /**
     * This function retrieves an item from the browser's local storage.
     * It first checks if the 'browser' object and 'browser.storage' are defined, which indicates that the browser is Firefox.
     * If so, it calls the _get_from_localstorage_firefox() function to retrieve the item.
     * If 'browser' and 'browser.storage' are not defined, it checks if the 'chrome' object and 'chrome.storage' are defined, which indicates that the browser is Chrome.
     * If so, it calls the _get_from_localstorage_chrome() function to retrieve the item.
     * If neither 'browser.storage' nor 'chrome.storage' are defined, it throws an error indicating that the browser is unsupported.
     * 
     * @param {String} itemID - The ID of the item to retrieve from local storage.
     * @returns {Promise} A Promise that resolves with the retrieved object, or undefined if the item was not found in local storage.
     * @throws {Error} If the browser is not supported.
     */
    async _get_from_localstorage(itemID) {
        if (typeof browser !== 'undefined' && browser.storage) {
            // Firefox
            return this._get_from_localstorage_firefox(itemID);
        } else if (typeof chrome !== 'undefined' && chrome.storage) {
            // Chrome
            return this._get_from_localstorage_chrome(itemID);
        } else {
            throw new Error('Unsupported browser');
        }
    }

    /**
     * This function saves an object to Chrome's sync storage.
     * It first creates a storage object with a single property, where the key is the item ID and the value is the JSON string representation of the input object.
     * It then sends a request to the browser's storage API to set the storage object.
     * If an error occurs during this process, it rejects the Promise with the error.
     * If no error occurs, it logs a success message and resolves the Promise.
     * 
     * @param {Object} obj - The object to save to sync storage.
     * @param {String} itemID - The ID to use for the object in sync storage.
     * @returns {Promise} A Promise that resolves when the object has been saved to sync storage.
     * @throws {Error} If an error occurred while saving the object.
     */
    async _save_to_localstorage_chrome(obj, itemID) {
        const storageObject = {};
        storageObject[itemID] = JSON.stringify(obj);

        return new Promise((resolve, reject) => {
            chrome.storage.sync.set(storageObject, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    console.log(itemID, "was successfully saved to LocalStorage");
                    resolve();
                }
            });
        });
    }

    /**
     * This function retrieves an item from Chrome's sync storage.
     * It sends a request to the browser's storage API to get the item with the specified ID.
     * If an error occurs during this process, it rejects the Promise with the error.
     * If no error occurs, it extracts the item from the result using the item ID.
     * If the item is undefined, it returns undefined.
     * Otherwise, it parses the item as JSON and resolves the Promise with the resulting object.
     * 
     * @param {String} itemID - The ID of the item to retrieve from sync storage.
     * @returns {Promise} A Promise that resolves with the retrieved object, or undefined if the item was not found in sync storage.
     * @throws {Error} If an error occurred while retrieving the item.
     */
    async _get_from_localstorage_chrome(itemID) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(itemID, (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    const storedJsonString = result[itemID];
                    if (storedJsonString === undefined) {
                        return undefined;
                    }
                    const retrievedObject = JSON.parse(storedJsonString);
                    resolve(retrievedObject);
                }
            });
        });
    }

    /**
     * This function saves an object to Firefox's local storage.
     * It first creates a storage object with a single property, where the key is the item ID and the value is the JSON string representation of the input object.
     * It then sends a request to the browser's storage API to set the storage object.
     * 
     * @param {Object} obj - The object to save to local storage.
     * @param {String} itemID - The ID to use for the object in local storage.
     * @returns {Promise} A Promise that resolves when the object has been saved to local storage.
     */
    async _save_to_localstorage_firefox(obj, itemID) {
        const storageObject = {};
        storageObject[itemID] = JSON.stringify(obj);
    
        return browser.storage.sync.set(storageObject);
    }

    /**
     * This function retrieves an item from Firefox's local storage.
     * It first sends a request to the browser's storage API to get the item with the specified ID.
     * It then extracts the item from the result using the item ID.
     * If the item is undefined, it returns undefined.
     * Otherwise, it parses the item as JSON and returns the resulting object.
     * 
     * @param {String} itemID - The ID of the item to retrieve from local storage.
     * @returns {Object|undefined} The retrieved object, or undefined if the item was not found in local storage.
     */
    async _get_from_localstorage_firefox(itemID) {
        const result = await browser.storage.sync.get(itemID);
        
        const storedJsonString = result[itemID];
        if (storedJsonString === undefined) {
            return undefined;
        }
        const retrievedObject = JSON.parse(storedJsonString);
        return retrievedObject;
    }

    /**
     * This function retrieves student data from local storage.
     * It calls the _get_from_localstorage() function with the key "student" to fetch the data.
     * The fetched data is then returned.
     * 
     * @returns {Object} The student data from local storage.
     */
    async _get_student_data_from_local_storage() {
        const student_data = await this._get_from_localstorage("student");
        return student_data;
    }

    /**
     * This function fetches module data from the MyCampus API.
     * It first defines the API URL.
     * It then sends a GET request to the API using the Fetch API.
     * If the response is not OK (status code is not in the range 200-299), it throws an error with the status code.
     * If the response is OK, it parses the response body as JSON and returns the resulting data.
     * If any error occurs during this process, it logs the error and rethrows it.
     * 
     * @returns {Object} The module data from the MyCampus API.
     * @throws {Error} If the network response was not OK or if any other error occurred.
     */
    async _fetchData_MyCampus() {
        const API_URL = "https://mycampus.hslu.ch/de-ch/api/anlasslist/load/?page=1&per_page=69&total_entries=69&datasourceid=5158ceaf-061f-49aa-b270-fc309c1a5f69";
        try {
            const headers = new Headers();
            let response = await fetch(API_URL, { headers });
           if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }
            let data = await response.json();
            return data;
        } catch (error) {
            console.error('Something went wrong:', error);
            throw error;
        }
    }

    /**
     * This function determines the start date of the spring study period for a given year.
     * It first creates a Date object for the 20th of February of the input year.
     * It then gets the day of the week for this date.
     * If the day of the week is not Monday (1), it subtracts the number of days until the previous Monday from the date.
     * This is done by subtracting ((day_of_week + 6) % 7) days from the date.
     * The function then returns the date of the start of the spring study period.
     * 
     * @param {Number} year - The year for which to determine the start of the spring study period.
     * @returns {Number} The date of the start of the spring study period.
     */
    _get_study_start_spring(year) {
        const date = new Date(year, 1, 20);
        const day_of_week = date.getDay();

        if (day_of_week !== 1) {
            date.setDate(date.getDate() - ((day_of_week + 6) % 7));
        }

        return date.getDate();
    }

    /**
     * This function determines the start date of the autumn study period for a given year.
     * It first creates a Date object for the 20th of September of the input year.
     * It then gets the day of the week for this date.
     * If the day of the week is not Monday (1), it subtracts the number of days until the previous Monday from the date.
     * This is done by subtracting ((day_of_week + 6) % 7) days from the date.
     * The function then returns the date of the start of the autumn study period.
     * 
     * @param {Number} year - The year for which to determine the start of the autumn study period.
     * @returns {Number} The date of the start of the autumn study period.
     */
    _get_study_start_autumn(year) {
        const date = new Date(year, 8, 20);
        const day_of_week = date.getDay();

        if (day_of_week !== 1) {
            date.setDate(date.getDate() - ((day_of_week + 6) % 7));
        }

        return date.getDate();
    }

    /**
     * This function determines the semester of a given date.
     * It first extracts the day, month, and year from the date.
     * It then determines the semester based on the month and day.
     * If the month is September and the day is before the start of the autumn study period, the semester is 'F' (Spring).
     * If the month is September and the day is on or after the start of the autumn study period, the semester is 'H' (Autumn).
     * If the month is February and the day is before the start of the spring study period, the semester is 'H' (Autumn).
     * If the month is February and the day is on or after the start of the spring study period, the semester is 'F' (Spring).
     * If the month is October through January, the semester is 'H' (Autumn).
     * Otherwise, the semester is 'F' (Spring).
     * The function then returns the semester code, which is the semester letter followed by the last two digits of the year.
     * 
     * @param {String} date - The date for which to determine the semester.
     * @returns {String} The semester code.
     */
    _get_semester_from_date(date) {
        const extracted_date = new Date(date);
        const day_of_month = extracted_date.getDate();
        const year = extracted_date.getFullYear();
        const month = extracted_date.getMonth() + 1;
      
        // Determine the semester (H for Autumn, F for Spring)
        let semester = null;
        if (month == 9 && day_of_month < this._get_study_start_autumn(year)) {
            semester = 'F';
        } else if (month == 9 && day_of_month >= this._get_study_start_autumn(year)) {
            semester = 'H';
        } else if (month == 2 && day_of_month < this._get_study_start_spring(year)) {
            semester = 'H';
        } else if (month == 2 && day_of_month >= this._get_study_start_spring(year)) {
            semester = 'F';
        } else if (month >= 10 || month < 2) {
            semester = 'H';
        } else {
            semester = 'F';
        }

        return semester + (year % 100).toString();
    }

    /**
     * This function determines the module type of a given module for a specific study program.
     * It first creates a map that associates short study program names with their full names.
     * It then uses this map to get the full name of the input study program.
     * After that, it filters the module offers of the input module to find the offer that matches the full study program name.
     * If such an offer is found, it returns the module type of that offer.
     * 
     * @param {Object} extracted_module - The module data, which includes a 'ModuleOffers' property.
     * @param {String} studyProgram - The short name of the study program.
     * @returns {String} The module type of the module for the study program.
     */
    async _get_module_type(extracted_module, studyProgram) {
        const studyProgramMap = {
            "i": "Informatik",
            "aiml": "Artificial Intelligence & Machine Learning",
            "ics": "Information & Cyber Security",
            "wi": "Wirtschaftsinformatik",
            "di": "Digital Ideation"
        };
        const fullName = studyProgramMap[studyProgram.toLowerCase()];
        const module_offers = extracted_module.ModuleOffers;
        const module_offer = module_offers.filter(offer => offer.DegreeProgramme === fullName);
        return module_offer[0].ModuleType;
    }

    /**
     * This function combines module data and module event data for a given semester.
     * It first fetches the modules and module events for the semester.
     * If no modules are found, it returns null.
     * It then iterates over the modules, and for each module, it finds the corresponding module event (if any) by matching the 'ModuleShortName' property.
     * The module data and module event data are combined into a single object, which is then added to an array.
     * After all modules have been processed, the array of combined module data is returned.
     * 
     * @param {String} semester - The semester for which to fetch and combine data.
     * @returns {Array|null} An array of combined module data, or null if no modules were found for the semester.
     */
    async _get_combined_module_data(semester) {
        const modules = await this.get_modules_by_semester(semester);
        if (modules === null) {
            return null;
        }
        const module_events = await this.get_module_events_by_semester(semester);
        const combined_module_data = [];
        for (let module of modules) {
            const module_event = module_events.filter(event => event.ModuleShortName === module.ShortName);
            const combined_module = {
                ...module,
                ...module_event[0]
            };
            combined_module_data.push(combined_module);
        }
        return combined_module_data;
    }

    /**
     * This function extracts the weekdays and times from a list of dates.
     * It first initializes an empty array to store the extracted dates.
     * It then iterates over the input dates, and for each date, it splits it into a date string and a time string.
     * The time string is further split into a start time and an end time.
     * The date string is reformatted into a 'year-month-day' format and used to create a Date object.
     * The weekday of the Date object is determined and added to the start time and end time to form an 'extracted date'.
     * The extracted date is then added to the array of extracted dates.
     * After all dates have been processed, any duplicate extracted dates are removed.
     * 
     * @param {Array} dates - An array of date strings in the format 'day.month.yearThour:minute/hour:minute'.
     * @returns {Array} An array of unique extracted dates in the format 'weekday/start time/end time'.
     */
    _extract_weekdays_with_time(dates) {
        const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
        const extracted_dates = [];

        for (let date of dates) {
            const [dateString, timeString] = date.split('T');
            const [startTime, endTime] = timeString.split('/');

            const [day, month, year] = dateString.split('.');
            const reformated_dateString = `${year}-${month}-${day}`;
            const dateObj = new Date(reformated_dateString);
            const weekday = weekdays[dateObj.getDay()];

            const extractedDate = `${weekday}/${startTime}/${endTime}`;

            extracted_dates.push(extractedDate);
        }

        // Remove duplicate weekdays
        const unique_weekdays = [...new Set(extracted_dates)];

        return unique_weekdays;
    }

    /**
     * This function determines the 'durchfuehrung' (execution) of a module based on its dates and lesson formats.
     * It first extracts the dates and lesson formats from the filtered data.
     * If the lesson format is "Asynchron", it returns null, as asynchronous modules do not have a fixed schedule.
     * Otherwise, it calls the _extract_weekdays_with_time() function with the dates to determine the schedule of the module.
     * 
     * @param {Object} filtered_data - The filtered module data, which includes a 'Dates' property and a 'LessonFormats' property.
     * @returns {String|null} The schedule of the module, or null if the module is asynchronous.
     */
    _get_durchfuehrung(filtered_data) {
        const dates = filtered_data.Dates
        const lesson_formats = filtered_data.LessonFormats;
        if (lesson_formats == "Asynchron") {
            return null;
        }
        return this._extract_weekdays_with_time(dates);
    }

    /**
     * This function filters and processes module data from MyCampus.
     * It first filters out modules with null ECTS points.
     * Then, for each remaining module, it extracts the module name, semester, note, grade, and ECTS points.
     * It also attempts to fetch additional data about the module from an API, and if successful, it extracts the module type and durchfuehrung.
     * If the API call fails or if the module type or durchfuehrung cannot be extracted, it logs an error message and sets the corresponding property to "undefined" or null.
     * The processed module data is then added to an array.
     * 
     * @param {Object} data - The raw module data from MyCampus.
     * @param {String} studyProgram - The study program of the student.
     * @returns {Array} An array of processed module objects.
     */
    async _get_filtered_modules_from_mycampus(data, studyProgram) {
        const filtered_data = data.items.filter(module => module.ects !== null);
        let modules = [];

        for (let module of filtered_data) {
            let module_to_add = {};
            module_to_add.moduleName = module.anlassnumber.split('_')[1]; // Extract module name from anlassnumber
            // Skip module if no module name is found
            if (module_to_add.moduleName === undefined) { 
                console.log("No module name found for", module)
                continue;
            }
            module_to_add.moduleName = module_to_add.moduleName.split('.')[0]; // Remove trailing point
            module_to_add.semester = this._get_semester_from_date(module.from); // Extract semester from date
            // Match module with actual module
            const semester_module_data = await this._get_combined_module_data(module_to_add.semester);
            // Skip module if API call failed
            if (semester_module_data === null) {
                console.log("API Error, could not fetch module data for", module_to_add.moduleName);
                continue;
            }
            const search_name = module_to_add.moduleName;
            let extracted_module = null;
            const extracted_modules = semester_module_data.filter(module => module.EventoIdentifier.includes(search_name));
            if (extracted_modules.length > 1) {
                const search_name_with_ = "_" + search_name + "_";
                const search_name_with_point = "_" + search_name + ".";
                const first_potential_extracted_module = extracted_modules.filter(module => module.EventoIdentifier.includes(search_name_with_));
                const second_potential_extracted_module = extracted_modules.filter(module => module.EventoIdentifier.includes(search_name_with_point));
                if (first_potential_extracted_module.length > 0) {
                    extracted_module = first_potential_extracted_module[0];
                } else if (second_potential_extracted_module.length > 0) {
                    extracted_module = second_potential_extracted_module[0];
                } else {
                    console.log("No matching module found for", search_name);
                }
            } else {
                extracted_module = extracted_modules[0];
            }
            module_to_add.note = parseFloat(module.note);
            module_to_add.grade = module.grade;
            module_to_add.ects = parseInt(module.ects);
            try {
                module_to_add.moduleType = await this._get_module_type(extracted_module, studyProgram);
            } catch (error) {
                console.log("Extracted module undefined:", extracted_module);
                module_to_add.moduleType = "undefined";
            }
            try {
                module_to_add.durchfuehrung = this._get_durchfuehrung(extracted_module);
            } catch (error) {
                module_to_add.durchfuehrung = null;
            }
            modules.push(module_to_add);
        }

        // Find duplicates based on moduleName
        const grouped_modules = [];
        const moduleNameSet = new Set();
        for (let module of modules) {
            if (moduleNameSet.has(module.moduleName)) {
                // Duplicate found, add to grouped_modules
                const existingGroup = grouped_modules.find(group => group.moduleName === module.moduleName);
                existingGroup.modules.push(module);
            } else {
                // New moduleName, create a new group
                moduleNameSet.add(module.moduleName);
                grouped_modules.push({
                    moduleName: module.moduleName,
                    modules: [module]
                });
            }
        }

        // Filter duplicates based on note
        const filtered_modules = [];
        for (let module_group of grouped_modules) {
            if (module_group.modules.length > 1) {
                const module_group_list = module_group.modules;
                for (let module_duplicate of module_group_list) {
                    if (module_duplicate.note !== null && !isNaN(module_duplicate.note)) {
                        filtered_modules.push(module_duplicate);
                    }
                }
            } else {
                filtered_modules.push(module_group.modules[0]);
            }
        }

        return filtered_modules;
    }

    /**
     * This function determines the earliest semester from a list of visited modules.
     * It iterates over the visited_modules array and checks each module's semester.
     * If a module's semester is earlier than the current startSemester, or if startSemester is null,
     * it updates startSemester to be that module's semester.
     * 
     * @param {Array} visited_modules - An array of module objects, each with a 'semester' property.
     * @returns {Number} The earliest semester found among the visited modules, or null if no semesters are found.
     */
    _get_start_semester(visited_modules) {
        let startSemester = null;
        for (let module of visited_modules) {
            if (module.semester && (!startSemester || module.semester < startSemester)) {
                startSemester = module.semester;
            }
        }
        return startSemester;
    }

    /**
     * This function calculates the study schedule (full-time or part-time) based on the visited modules.
     * It first creates an object to store the total ECTS points per semester.
     * It then iterates over the visited modules, and for each module that has a semester, it adds the module's ECTS points to the total for that semester.
     * After that, it calculates the average ECTS points per semester.
     * If the average is 27 or more, it returns "Vollzeit" (full-time). Otherwise, it returns "Teilzeit" (part-time).
     * 
     * @param {Array} visited_modules - An array of module objects, each with a 'semester' and 'ects' property.
     * @returns {String} The study schedule ("Vollzeit" or "Teilzeit").
     */
    _get_study_schedule(visited_modules) {
        let ects_per_semester = {};

        for (let module of visited_modules) {
            if (module.semester) {
                if (!ects_per_semester[module.semester]) {
                    ects_per_semester[module.semester] = 0;
                }
                ects_per_semester[module.semester] += parseInt(module.ects, 10);
            }
        }

        let total = 0;
        let count = 0;
        for (let value in ects_per_semester) {
            total += ects_per_semester[value];
            count++;
        }
        
        const average = total / count;

        if (average >= 27) {
            return "Vollzeit";
        } else {
            return "Teilzeit";
        }
    }

    /**
     * This function extracts the study program from a webpage.
     * It first finds an anchor element with a specific href attribute.
     * If such an element is found, it extracts the inner text and processes it to get the study program.
     * The processing involves splitting the text by "." and "_", and removing "BSC" from the result.
     * If no such element is found, it logs an error message and returns null.
     * 
     * @returns {String} The extracted study program, or null if it could not be extracted.
     */
    _get_study_program() {
        let anchorElement = document.querySelector('a[href="/de-ch/service-sites/login"]');
        let text = anchorElement ? anchorElement.innerText : null;
        if (text !== null) {
            const studyProgram = text.split(".")[1].split("_")[0].replace("BSC", "");
            return studyProgram;
        }
        console.log("Could not extract study program from MyCampus")
        return null;
    }

    /**
     * This function extracts student data from a webpage.
     * It first initializes an empty student object, then populates its properties by calling various helper functions.
     * The study program is determined by calling _get_study_program().
     * The visited modules are fetched from MyCampus by calling _fetchData_MyCampus() and _get_filtered_modules_from_mycampus().
     * The start semester and study schedule are determined based on the visited modules.
     * The study major is currently set to null.
     * 
     * @returns {Object} The populated student object.
     */
    async _get_student_data_from_webpage() {

        let student = {};
        student.studyProgram = this._get_study_program();
        // get visited Modules from MyCampus
        const MyCampus_data = await this._fetchData_MyCampus();
        let MyCampus_modules = await this._get_filtered_modules_from_mycampus(MyCampus_data, student.studyProgram);
        student.modulesVisited = MyCampus_modules;

        student.startSemester = this._get_start_semester(MyCampus_modules);
        student.studySchedule = this._get_study_schedule(MyCampus_modules);
        student.studyMajor = null

        return student;
    }


/**
 * ============================================================
 * 
 * Start of Public methods.
 * Only this part below is relevant for usage of DataExtractor.
 * 
 * ============================================================
 */

    /**
     * This function retrieves module data for a specific semester.
     * It first calls the _get_data_by_semester() function with the input semester to fetch the data.
     * If an error occurs during this process, it logs the error and returns null.
     * If no error occurs, it returns the 'Modules' property of the fetched data.
     * 
     * @param {String} semester - The semester for which to retrieve module data.
     * @returns {Object|null} The module data for the semester, or null if an error occurred.
     */
    async get_modules_by_semester(semester) {
        try {
            let data = await this._get_data_by_semester(semester);
            return data['Modules'];
        } catch (error) {
            console.error('Error in get_modules_by_semester');
            return null;
        }
    }

    /**
     * This function retrieves module events for a specific semester.
     * It first calls the _get_data_by_semester() function with the input semester to fetch the data.
     * If an error occurs during this process, it logs the error and returns null.
     * If no error occurs, it returns the 'ModuleEvents' property of the fetched data.
     * 
     * @param {String} semester - The semester for which to retrieve module events.
     * @returns {Object|null} The module events for the semester, or null if an error occurred.
     */
    async get_module_events_by_semester(semester) {
        try {
            let data = await this._get_data_by_semester(semester);
            return data['ModuleEvents'];
        } catch (error) {
            console.error('Error in get_module_events_by_semester');
            return null;
        }
    }

/**
 * ============================================================
 * Interaction with Student
 */
    /**
     * This function retrieves student data.
     * It calls the _get_student_data_from_local_storage() function to fetch the data from local storage.
     * The fetched data is then returned.
     * 
     * @returns {Object} The student data.
     */
    async get_student_data() {
        const data = await this._get_student_data_from_local_storage();
        return data;
    }

    /**
     * This function extracts student data for a specific study program.
     * It calls the _get_student_data_from_webpage() function with the input study program to fetch the data.
     * The fetched data is then returned.
     * 
     * @param {String} studyProgram - The study program for which to retrieve student data.
     * @returns {Object} The student data for the specified study program.
     */
    async extract_student_data(studyProgram) {
        const data = await this._get_student_data_from_webpage(studyProgram);
        return data;
    }

    /**
     * This function saves student data to local storage.
     * It calls the _save_to_localstorage() function with the input student data and the key "student".
     * If the data is successfully saved, it logs a success message and returns true.
     * If an error occurs during this process, it logs an error message and returns false.
     * 
     * @param {Object} student - The student data to save to local storage.
     * @returns {Boolean} True if the data was successfully saved, false otherwise.
     */
    save_student_data(student) {
        try {
            this._save_to_localstorage(student, "student");
            console.log("Successfully saved Student to Localstorage");
            return true;
        } catch {
            console.log("Student Object could not be saved.");
            return false;
        }
    }

/**
 * ============================================================
 * Interaction with ContentGenerator
 */
    /**
     * This function retrieves module events for a specific semester and splits modules with multiple sessions per week into individual objects.
     * It first retrieves the student data and extracts the visited modules.
     * It then filters the visited modules for the input semester.
     * For each module in the filtered list, it creates a new object for each session in the 'durchfuehrung' array, copying all properties of the original module and replacing 'durchfuehrung' with an array containing only the current session.
     * It replaces the 'modulesVisited' property of the student data with the new list of module objects and returns the modified student data.
     * 
     * @param {String} semester - The semester for which to retrieve and split module events.
     * @returns {Object} The student data, with 'modulesVisited' replaced by the new list of module objects.
     */
    async get_splited_module_events_by_semester(semester) {
        let student_data = await this.get_student_data(); // get student data from student object
        const visited_modules = student_data.modulesVisited; // extract all visited modules
        const visited_modules_in_semester = visited_modules.filter(item => item.semester === semester); // filter the modules for a semester

        // Split modules with multiple sessions per week into individual objects
        const expandedList = visited_modules_in_semester.flatMap(item => {
            return item.durchfuehrung.map(schedule => ({
              ...item,
              durchfuehrung: [schedule]
            }));
        });

        student_data.modulesVisited = expandedList; // replace original modulesVisited with new list

        return student_data;
    }

    /**
     * This function retrieves all modules for a specific semester and enriches them with student data.
     * It first retrieves all modules for the input semester and the student data.
     * It then filters the visited modules for the input semester.
     * For each visited module, it finds the corresponding module in the list of all modules and adds it to a new list.
     * It then removes all matched modules from the list of all modules and adds them back with the 'StudentData' property set to the visited module.
     * 
     * @param {String} semester - The semester for which to retrieve modules.
     * @returns {Array} The list of all modules for the semester, with visited modules enriched with student data.
     */
    async get_modules_for_module_list(semester) {
        let modules = await this.get_modules_by_semester(semester); // get all modules of this semester
        if (modules === null) {
            return null;
        }

        const student_data = await this.get_student_data(); // get student data from student object
        const visited_modules = student_data.modulesVisited; // extract all visited modules
        const visited_modules_in_semester = visited_modules.filter(item => item.semester === semester); // filter the modules for a semester
        
        let matched_modules = [];

        // Match all student modules with actual modules
        for (let i = 0; i < visited_modules_in_semester.length; i++) {
            let visited_module = visited_modules_in_semester[i];
            const module_name = visited_module.moduleName;
            const matched_module = modules.filter(item => item.ShortName === module_name);
            matched_modules = [...matched_modules, matched_module];
        }

        // Remove all matched modules and add them back with added StudentData
        for (let i = 0; i < matched_modules.length; i++) {
            let matched_module = matched_modules[i][0];
            let visited_module = visited_modules_in_semester[i];
            modules = modules.filter(item => item.ShortName !== matched_module.ShortName);
            matched_module.StudentData = visited_module;
            modules = [...modules, matched_module];
        }

        return modules;
    }

    /**
     * This function retrieves the required ECTS credits per module type for a specific degree program.
     * It first converts the input degree program to lowercase.
     * It then constructs the API path by appending the degree program to the '/ects/' path.
     * It calls the _fetchData_API() function with this path to fetch the data.
     * The 'result' property of the fetched data is then returned.
     * 
     * @param {String} degree_programm - The degree program for which to retrieve the required ECTS credits per module type.
     * @returns {Object} The required ECTS credits per module type for the specified degree program.
     */
    async get_required_ects_per_moduletype(degree_programm) {
        degree_programm = degree_programm.toLowerCase();
        let path = '/ects/' + degree_programm;
        let data = await this._fetchData_API(path);
        data = data.result;
        return data;
    }

    /**
     * This function retrieves the list of available semesters from the API.
     * It calls the _fetchData_API() function with the '/semesters/available' path to fetch the data.
     * The 'semesters' property of the 'result' property of the fetched data is then returned.
     * 
     * @returns {Array} The list of available semesters.
     */
    async get_semester_list() {
        let data = await this._fetchData_API('/semesters/available');
        const semesterList = data.result;
        return semesterList.semesters;
    }
}
