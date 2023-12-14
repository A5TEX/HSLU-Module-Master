// Static DataExtractor Class
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

    // Send http get request to api url
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

    // get json dump of a specific semester
    async _get_data_by_semester(semester) {
        let path = '/modules/' + semester;
        let data = await this._fetchData_API(path);
        if (data === null) {
            return null;
        }
        return data['result'];
    }

    // save object to localstorage
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

    // get object from localstorage
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

    async _save_to_localstorage_firefox(obj, itemID) {
        const storageObject = {};
        storageObject[itemID] = JSON.stringify(obj);
    
        return browser.storage.sync.set(storageObject);
    }

    async _get_from_localstorage_firefox(itemID) {
        const result = await browser.storage.sync.get(itemID);
        
        const storedJsonString = result[itemID];
        if (storedJsonString === undefined) {
            return undefined;
        }
        const retrievedObject = JSON.parse(storedJsonString);
        return retrievedObject;
    }

    // extracts student from localstorage
    async _get_student_data_from_local_storage() {
        const student_data = await this._get_from_localstorage("student");
        return student_data;
    }

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

    _get_study_start_spring(year) {
        const date = new Date(year, 1, 20);
        const day_of_week = date.getDay();

        if (day_of_week !== 1) {
            date.setDate(date.getDate() - ((day_of_week + 6) % 7));
        }

        return date.getDate();
    }

    _get_study_start_autumn(year) {
        const date = new Date(year, 8, 20);
        const day_of_week = date.getDay();

        if (day_of_week !== 1) {
            date.setDate(date.getDate() - ((day_of_week + 6) % 7));
        }

        return date.getDate();
    }

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

    async _get_module_type(extracted_module, studyProgram) {
        const studyProgramMap = {
            "i": "Informatik",
            "aiml": "Artificial Intelligence & Machine Learning",
            "cs": "Information & Cyber Security",
            "wi": "Wirtschaftsinformatik"
        };
        const fullName = studyProgramMap[studyProgram.toLowerCase()];
        const module_offers = extracted_module.ModuleOffers;
        const module_offer = module_offers.filter(offer => offer.DegreeProgramme === fullName);
        return module_offer[0].ModuleType;
    }

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

    _get_durchfuehrung(filtered_data) {
        const dates = filtered_data.Dates
        const lesson_formats = filtered_data.LessonFormats;
        if (lesson_formats == "Asynchron") {
            return null;
        }
        return this._extract_weekdays_with_time(dates);
    }

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
                console.log("Extraced module undefined:", extracted_module);
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

    _get_start_semester(visited_modules) {
        let startSemester = null;
        for (let module of visited_modules) {
            if (module.semester && (!startSemester || module.semester < startSemester)) {
                startSemester = module.semester;
            }
        }
        return startSemester;
    }

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

    _get_study_program() {
        let anchorElement = document.querySelector('a[href="/de-ch/service-sites/login"]');
        let text = anchorElement ? anchorElement.innerText : null;
        return text.split(".")[1].split("_")[0].replace("BSC", "");
    }

    // extracts student data from mycampus
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

    // get a list of Module objects of a specific semester
    async get_modules_by_semester(semester) {
        try {
            let data = await this._get_data_by_semester(semester);
            return data['Modules'];
        } catch (error) {
            console.error('Error in get_modules_by_semester');
            return null;
        }
    }

    // get a list of ModuleEvent objects of a specific semester
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
    // get student data from localstorage or extract from webpage
    async get_student_data() {
        const data = await this._get_student_data_from_local_storage();
        return data;
    }

    async extract_student_data(studyProgram) {
        const data = await this._get_student_data_from_webpage(studyProgram);
        return data;
    }

    // save student object to localstorage
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
    // Return a List of Module Events split by Durchführungsblock | #1
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

    // Return a list of Modules with added Student Information | #2
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

    // Return Key-Value pairs of moduletype: ects_count for a degree programm | #3
    async get_required_ects_per_moduletype(degree_programm) {
        degree_programm = degree_programm.toLowerCase();
        let path = '/ects/' + degree_programm;
        let data = await this._fetchData_API(path);
        data = data.result;
        return data;
    }

    // Return a list of all available semesters | #4
    async get_semester_list() {
        let data = await this._fetchData_API('/semesters/available');
        const semesterList = data.result;
        return semesterList.semesters;
    }
}
