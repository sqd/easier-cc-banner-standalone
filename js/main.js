"use strict";
//const $ = document.querySelector;
const course_pool = $('#course_pool');
const MAX_AUTOCOMPLETION = 8;
const FLASH_COURSE_POOL_TRANSITION_MS = 200;
const FLASH_COURSE_POOL_COLOR = '#ffcdd2';

const depart2name = {
    "JD": "Jedi-ing",
    "AN": "Anthropology",
    "AR": "Arabic",
    "AH": "Art History",
    "AS": "Art Studio",
    "PA": "Asian Studies",
    "BY": "Biology",
    "CH": "Chemistry",
    "CN": "Chinese Language",
    "CL": "Classics",
    "CO": "Comparative Literature",
    "CP": "Computer Science",
    "DS": "Dance Studio",
    "DA": "Dance Theory",
    "EC": "Economics",
    "ED": "Education",
    "EN": "English",
    "EV": "Environmental Program",
    "FG": "Feminist & Gender Studies",
    "FM": "Film and Media Studies",
    "FS": "Film Studies",
    "FR": "French",
    "GS": "General Studies",
    "GY": "Geology",
    "GR": "German",
    "HE": "Hebrew",
    "HY": "History",
    "HK": "Human Biology and Kinesiology",
    "IT": "Italian",
    "JA": "Japanese",
    "MA": "Mathematics",
    "MB": "Molecular Biology",
    "MU": "Music",
    "BE": "Organismal Biology and Ecology",
    "PH": "Philosophy",
    "PC": "Physics",
    "PS": "Political Science",
    "PG": "Portuguese",
    "PY": "Psychology",
    "RM": "Race, Ethnicity, and Migration",
    "RE": "Religion",
    "RU": "Russian",
    "RS": "Russian & Eurasian Studies",
    "SO": "Sociology",
    "SW": "Southwest Studies",
    "SP": "Spanish",
    "HS": "Studies in Humanities",
    "NS": "Studies in Natural Science",
    "TH": "Theatre"
};

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}


var tableLoaded = false;

class Course {
    constructor(code, title, block, instructor, limit, reserved, available, waitlist) {
        this.code = code;
        this.section = null;
        this.title = title;
        this.block = block;
        this.instructor = instructor;
        this.limit = limit;
        this.reserved = reserved;
        this.available = available;
        this.waitlist = waitlist;
        this.crn = null;
        this.degree_requirement = null;
        this.location = null;
    }
}

function show_modal_window(schedule) {
    // preprocess data
    const codes = course_pool.val().split(',').filter(v => v);
    const departments = {};
    for (const code in codes) {
        if (!schedule[code])
            continue; // no such course
        const department_code = code.slice(0, 2);
        // 8 blocks
        if (!departments[department_code])
            departments[department_code] = new Array(8).fill(null).map((v) => []);
        for (const course in schedule[code]) {
            if (typeof course.block === "number")
                departments[department_code][course.block - 1].push(course);
            else
                departments[department_code][null].push(course); // un-parsable block number
        }
    }

    // if no valid courses
    if (!departments) {
        course_pool.css('transition', FLASH_COURSE_POOL_TRANSITION_MS + 'ms');
        course_pool.css('background-color', FLASH_COURSE_POOL_COLOR);
        setTimeout(() => {
            course_pool.css('background-color', 'transparent');
        }, 200);
        return;
    }

    // build table, build export array
    {
        const modal_container = $('#result_modal_container');
        modal_container.empty();
        const etable = document.createElement('table');

        for (let i = 1; i <= 8 + 1; i++)
            etable.insertRow(-1);

        const title_row = etable.rows[0];
        // no of block in the first column
        title_row.insertCell(-1);
        for (let i = 1; i <= 8; i++)
            etable.rows[i].insertCell(-1).innerText = i.toString();

        modal_container.appendChild(etable);

        for(const department in departments) {
            const title_cell = title_row.insertCell(-1);
            const department_fullname = depart2name[department];
            title_cell.innerText = department_fullname;
            title_cell.class('modal-course-title');
        }

        $.each(departs, function (depart, blocks) {
            var cell = modal_table.rows[0].insertCell(-1);
            var depart_name = depart2name[depart];
            cell.innerText = depart_name;
            cell.setAttribute('class', 'modal-course-title');
            var max_len = Math.max(...$(blocks).map((_, x) => x.length));
            for (i = 0; j < 8; j++) {
                var cell = modal_table.rows[j + 1].insertCell(-1);
                $.each(blocks[j], function () {
                    var div_container = document.createElement('div');
                    var course_code = this['course_no'];
                    div_container.setAttribute('class', 'modal-cell');
                    var id = guid();
                    div_container.innerHTML = `<div class="modal-course-id">${course_code} </div>
                    <!--div class="modal-course-name">${this['course_title'].replace(/(\[.*\])|(\(.*\))/, '')}<img height=13px width=13px src='img/outlink.svg' onclick="javascript:window.open('https://www.coloradocollege.edu/academics/curriculum/catalog/detail.html?courseid=${course_code}');"></div-->
                    <div class="modal-course-name"><a href="https://www.coloradocollege.edu/academics/curriculum/catalog/detail.html?courseid=${course_code}" target='_blank'>${this['course_title'].replace(/(\[.*\])|(\(.*\))/, '')}</a></div>

                    <div class="modal-course-info2">${/( |^)(\S*)$/.exec(this['instructor'])[2]}</div>
                    <div class="modal-course-info1">${this['available']}/${this['limit']}</div>
                    <div class="modal-course-info2">(${this['waitlist']}, ${this['reserved']})</div>`
                    $(div_container).find('.modal-course-id').css('cursor', 'pointer');
                    if (!($("#is_freshman").prop("checked") && this['reserved'] != 0) && !(this['available'] != 0))
                        $(div_container).addClass('modal-course-disabled');
                    else {
                        $(div_container).find(".modal-course-id").click(function () {
                            if ($(div_container).hasClass('wiggle')) {
                                $(div_container).removeClass('wiggle');
                                $(div_container).find(".modal-course-id").removeClass('modal-course-id-selected');
                            } else {
                                $(div_container).addClass('wiggle');
                                $(div_container).find(".modal-course-id").addClass('modal-course-id-selected');
                            }
                        });
                    }
                    cell.appendChild(div_container);
                });
            }
        });
    }


    //modal table style
    $('[data-remodal-id=result_modal]').css('max-width', '80%').css('min-width', '700px');
    var modalTableTrs = $('#result_modal_table').find('tr');
    //console.log(modalTableTrs);
    var modalTableTds = modalTableTrs.find('td');
    modalTableTrs.css('height', '70px');
    $(modalTableTrs[0]).css('height', 'auto');
    $(modalTableTds[0]).css('width', '5%');
    //title tds
    for (var i = 0; i < (modalTableTds.length - modalTableTrs.length) / modalTableTrs.length; i++) {
        var x = 100 * modalTableTrs.length / (modalTableTds.length - modalTableTrs.length);
        $(modalTableTds[i + 1]).css('width', (x - 5 / x).toString() + '%');
        $(modalTableTds[i + 1]).addClass('modal-course-title');
    }
    //all trs
    for (var i = 0; i < modalTableTrs.length; i++) {
        if (i % 2 == 0) {
            $(modalTableTrs[i]).css('background-color', '#eee');
        }

    }
    if (!tableLoaded) {
        $('#btn_export').append("<img src='img/print.png'></img>");
    }

    //export
    {
        $('#btn_export').off('click');
        $('#btn_export').click(function () {
            var html_dup = $('<div>').append($('#result_modal_table').clone());
            html_dup.find('.modal-course-id-selected').css('background-color', 'black');
            var html_string = html_dup.html();
            localStorage.setItem('print', html_string);
            window.open('print_page.html');
        });
    }
    $('[data-remodal-id=result_modal]').remodal().open();

    tableLoaded = true;
}

function main() {
    // add course pool dynamic styling
    {
        course_pool.focus(() => {
            $(".dropdown-menu").css('display', 'block');
            $(".dropdown-menu").addClass("hover-over-boxshadow");
            $("#course_pool").addClass("hover-over-boxshadow");
        });
        course_pool.blur(() => {
            $(".dropdown-menu").css('display', 'none');
            $(".dropdown-menu").removeClass("hover-over-boxshadow");
            $("#course_pool").removeClass("hover-over-boxshadow");
        });
    }

    const schedule_json = $.getJSON("./data.json");
    // a map of [course code] -> list of [courses offered in variable blocks]
    const schedule = {};
    // a flat list of courses for fuse to search in
    const flat_course_list = [];
    // which instructors teach a class
    const course_instructors = {};

    for (const code in schedule_json) {
        schedule[code] = [];
        course_instructors[code] = [];
        schedule_json[code].forEach(course_json => {
            const course = new Course(course_json);
            schedule[code].push(course);
            flat_course_list.push(course);
            course_instructors[code].push(course.instructor);
        });
        course_instructors[code] = course_instructors[code].join(', ');
    }

    // configure fuse auto-complete engine
    {
        const fuse_option = {
            shouldSort: true,
            threshold: 0.4,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 2,
            keys: [
                "code",
                "instructor",
                "title"]
        };
        const fuse = new Fuse(flat_course_list, fuse_option);

        const textcomplete_config =
            {
                match: /(^|,)([^,]+)$/,
                search: function (term, callback) {
                    // if is course number
                    const matches = [];
                    if (/(^|,)[a-zA-Z]{2,}\d*$/.test(term)) {
                        term = term.toUpperCase();
                        for (const course in flat_course_list) {
                            if (course.code.startsWith(term)) {
                                matches.push(course.code);
                                if (matches.length >= MAX_AUTOCOMPLETION) {
                                    callback(matches);
                                    return;
                                }
                            }
                        }
                    }
                    const fuzzy_result = fuse.search(term);
                    for (const course in fuzzy_result) {
                        matches.push(course.code);
                        if (matches.length >= MAX_AUTOCOMPLETION) {
                            callback(matches);
                            return;
                        }
                    }
                    callback(matches.slice(0, MAX_AUTOCOMPLETION));
                },
                template: function (code) {
                    const title = schedule[code][0].title;
                    // Prerequisites or other explanation are enclosed by brackets
                    const match_bracket = title.match(/\(.*\)/g);
                    const match_square_bracket = title.match(/\[.*\]/g);
                    const extra_text = (match_bracket + match_square_bracket).join(' ');
                    let menu_item = `<b>${code}</b><small>(${course_instructors[code]})</small><br><tag>${title}</tag>`;
                    if (extra_text)
                        menu_item += `<small style="color:grey">${extra_text}</small>`;
                    return menu_item;

                },
                replace: function (code) {
                    return `$1${code},`;
                }
            };
        new Textcomplete(new Textcomplete.editors.Textarea(course_pool).register([textcomplete_config]));
    }

    // register modal window event
    {
        $('#course_pool_confirm').click(() => {
            show_modal_window(schedule);
        });
        key('ctrl+enter', () => {
            if (course_pool.is(':focus'))
                show_modal_window(schedule);
        });
        key.filter = (ev => true);
    }
}
