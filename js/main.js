function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
}


var tableLoaded=false;
function show_modal_window(schedule) {
    //preprocess data
    {
        //sieve out duplicated courses
        var courses = $('#course_pool').val().toUpperCase().split(',');
        var hash = {};
        $.each(courses, function () { hash[this] = true; });
        courses = [];
        $.each(hash, function (k, v) { courses.push(k); });

        var departs = {};
        $.each(courses, function () {
            var course_code = this;
            if (schedule[course_code] == null) return;
            var depart_code = course_code.slice(0, 2);
            if (departs[depart_code] == null) departs[depart_code] = [[], [], [], [], [], [], [], []];
            $.each(schedule[course_code], function () {
                var block = parseInt(this['block']);
                if (isNaN(block)) return;
                departs[depart_code][block - 1].push(this);
            });
        });
    }

    //if no valid courses
    if(Object.keys(departs).length == 0) {
        $('#course_pool').css('transition', '200ms');
        $('#course_pool').css('background-color', '#ffcdd2');
        setTimeout(function(){
            $('#course_pool').css('transition', '200ms');
            $('#course_pool').css('background-color', 'transparent');
        }, 200);
        return;
    }

    //build table, build export array
    {
        var modal_table = $('#result_modal_table')[0];
        modal_table.children[0].innerHTML = '';
        for (i = 0; i < 9; i++) modal_table.insertRow(-1);
        for (i = 1; i < 9; i++) {
            var cell = modal_table.rows[i].insertCell(-1);
            cell.innerText = i;
        }
        modal_table.rows[0].insertCell(-1);

        var depart2name = { "JD": "Jedi-ing", "AN": "Anthropology", "AR": "Arabic", "AH": "Art History", "AS": "Art Studio", "PA": "Asian Studies", "BY": "Biology", "CH": "Chemistry", "CN": "Chinese Language", "CL": "Classics", "CO": "Comparative Literature", "CP": "Computer Science", "DS": "Dance Studio", "DA": "Dance Theory", "EC": "Economics", "ED": "Education", "EN": "English", "EV": "Environmental Program", "FG": "Feminist & Gender Studies", "FM": "Film and Media Studies", "FS": "Film Studies", "FR": "French", "GS": "General Studies", "GY": "Geology", "GR": "German", "HE": "Hebrew", "HY": "History", "HK": "Human Biology and Kinesiology", "IT": "Italian", "JA": "Japanese", "MA": "Mathematics", "MB": "Molecular Biology", "MU": "Music", "BE": "Organismal Biology and Ecology", "PH": "Philosophy", "PC": "Physics", "PS": "Political Science", "PG": "Portuguese", "PY": "Psychology", "RM": "Race, Ethnicity, and Migration", "RE": "Religion", "RU": "Russian", "RS": "Russian & Eurasian Studies", "SO": "Sociology", "SW": "Southwest Studies", "SP": "Spanish", "HS": "Studies in Humanities", "NS": "Studies in Natural Science", "TH": "Theatre" };
        $.each(departs, function (depart, blocks) {
            var cell = modal_table.rows[0].insertCell(-1);
            var depart_name = depart2name[depart];
            cell.innerText = depart_name;
            cell.setAttribute('class', 'modal-course-title');
            var max_len = Math.max(...$(blocks).map((_,x)=>x.length));
            for (j = 0; j < 8; j++) {
                var cell = modal_table.rows[j + 1].insertCell(-1);
                $.each(blocks[j], function () {
                    var div_container = document.createElement('div');
                    var course_code = this['course_no'];
                    div_container.setAttribute('class', 'modal-cell');
                    var id = guid();
                    div_container.innerHTML = `<div class="modal-course-id">${course_code} </div>
                    <!--div class="modal-course-name">${this['course_title'].replace(/(\[.*\])|(\(.*\))/,'')}<img height=13px width=13px src='img/outlink.svg' onclick="javascript:window.open('https://www.coloradocollege.edu/academics/curriculum/catalog/detail.html?courseid=${course_code}');"></div-->
                    <div class="modal-course-name"><a href="https://www.coloradocollege.edu/academics/curriculum/catalog/detail.html?courseid=${course_code}" target='_blank'>${this['course_title'].replace(/(\[.*\])|(\(.*\))/,'')}</a></div>

                    <div class="modal-course-info2">${/( |^)(\S*)$/.exec(this['instructor'])[2]}</div>
                    <div class="modal-course-info1">${this['available']}/${this['limit']}</div>
                    <div class="modal-course-info2">(${this['waitlist']}, ${this['reserved']})</div>`
                    $(div_container).find('.modal-course-id').css('cursor', 'pointer');
                    if(!($("#is_freshman").prop("checked") && this['reserved'] != 0) && !(this['available'] != 0))
                        $(div_container).addClass('modal-course-disabled');
                    else{
                        $(div_container).find(".modal-course-id").click(function(){
                            if($(div_container).hasClass('wiggle')){
                                $(div_container).removeClass('wiggle');
                                $(div_container).find(".modal-course-id").removeClass('modal-course-id-selected');
                            }
                            else{
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
    $('[data-remodal-id=result_modal]').css('max-width','80%').css('min-width','700px');
    var modalTableTrs = $('#result_modal_table').find('tr');
    //console.log(modalTableTrs);
    var modalTableTds = modalTableTrs.find('td');
    modalTableTrs.css('height','70px');
    $(modalTableTrs[0]).css('height','auto');
    $(modalTableTds[0]).css('width','5%');
    //title tds
    for(var i=0; i<(modalTableTds.length-modalTableTrs.length)/modalTableTrs.length; i++)
    {
        var x = 100*modalTableTrs.length/(modalTableTds.length-modalTableTrs.length);
        $(modalTableTds[i+1]).css('width',(x-5/x).toString()+'%');
        $(modalTableTds[i+1]).addClass('modal-course-title');
    }
    //all trs
    for(var i=0; i<modalTableTrs.length; i++)
    {
        if(i%2==0){
            $(modalTableTrs[i]).css('background-color','#eee');
        }

    }
    if(!tableLoaded)
    {
        $('#btn_export').append("<img src='img/print.png'></img>");
    }
    
    //export
    {
        $('#btn_export').off('click');
        $('#btn_export').click(function(){
            var html_dup = $('<div>').append($('#result_modal_table').clone());
            html_dup.find('.modal-course-id-selected').css('background-color', 'black');
            var html_string = html_dup.html(); 
            localStorage.setItem('print', html_string);
            window.open('print_page.html');
        });
    }
    $('[data-remodal-id=result_modal]').remodal().open();

    tableLoaded=true;
}

function on_tool_loaded(){
    //course scheduler style
    {
        $("#course_pool").focus(function () {
            $(".dropdown-menu").css('display', 'block');
            $(".dropdown-menu").addClass("hover-over-boxshadow");
            $("#course_pool").addClass("hover-over-boxshadow");
        });
        $("#course_pool").blur(function () {
            $(".dropdown-menu").css('display', 'none');
            $(".dropdown-menu").removeClass("hover-over-boxshadow");
            $("#course_pool").removeClass("hover-over-boxshadow");
        });
    }

    //confirm button positioning
    list_css = '';
    if($(window).width()<768){
        list_css = 'style/mobile_list.css';
        $('#course_pool').css('width', '90%').css('left', '5%');
        $('#course_pool_confirm').css('left',($(window).width()-75).toString()+'px' );
        if($(window).width()<350) $('.list-title').css('font-size', '13px');
    }else{
        list_css = 'style/desktop_list.css';
        $('#course_pool_confirm').css('left',($(window).width()*0.75-35-25).toString()+'px' );
        $( window ).resize(function() {
            $('#course_pool_confirm').css('left',($(window).width()*0.75-35-25).toString()+'px' );
        });
    }
    var fileref = document.createElement("link");
    fileref.rel = "stylesheet";
    fileref.type = "text/css";
    fileref.href = list_css;
    document.getElementsByTagName("head")[0].appendChild(fileref)

    $.ajax({
        dataType: "json",
        url: "data.json",
        mimeType: "application/json",
        success: function(schedule){
            var schedule_url = null;
            on_schedule_loaded(schedule);
        }
    });
}



function on_schedule_loaded(schedule) {
    //preprocess schedule data
    schedule['JD101'] = [{
        "course_no": 'JD101',
        "course_title": "Elementary Jedi-ing. [Prerequisite: Travelling to Dagobah. Be prepared for your professor's death.]",
        "instructor": 'Yoda',
        "block": "never"
    }];
    {
        var course_list = [];
        var instructor_sum = {};
        $.each(schedule, function () {
            var prof = '';
            var hash = {};
            $.each(schedule[this[0]['course_no']], function () {
                if (hash[this['instructor']] == null) {
                    prof += this['instructor'] + ', ';
                    hash[this['instructor']] = true;
                }
            });
            prof = prof.slice(0, -2);
            course_list.push({
                "course_code": this[0]["course_no"],
                "course_title": this[0]["course_title"],
                "instructor": prof
            });
            instructor_sum[this[0]['course_no']] = prof;
        });
    }

    var fuse = new Fuse(course_list, {
        shouldSort: true,
        threshold: 0.4,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 2,
        keys: [
            "course_code",
            "instructor",
            "course_title"]
    });

    new Textcomplete(new Textcomplete.editors.Textarea(document.getElementById('course_pool'))).register([
        {
            match: /(^|,)([^,]+)$/,
            search: function (term, callback) {
                //if is course number
                if(/(^|,)([A-Z][A-Z]|[a-z][a-z])\d{0,3}$/.test(term)){
                    term = term.toUpperCase();
                    var ans = [];
                    for(i=0;i<course_list.length;i++){
                        if(course_list[i]['course_code'].startsWith(term)){
                            ans.push(course_list[i]['course_code']);
                            if(ans.length >= 8) break;
                        }
                    }
                    if (ans.length != 0) {
                        callback(ans);
                        return;
                    }
                }
                var result = fuse.search(term);
                result = result.slice(0, 8);
                var match = [];
                $.each(result, function () { match.push(this['course_code']); });
                callback(match);
            },
            template: function (course_code) {
                var title = schedule[course_code][0]['course_title'].replace(/(\[.*\])/g, '<small style="color:grey">$1</small>').replace(/(\(.*\))/g, '<small style="color:grey">$1</small>');
                return `<b>${course_code}</b> <small>(${instructor_sum[course_code]})</small><br>${title}`
            },
            replace: function (course_code) {
                return '$1' + course_code + ',';
            }
        }
    ]);

    //modal window event
    {
        $('#course_pool_confirm').click(function () { show_modal_window(schedule) });
        key('ctrl+enter', function () {
            if ($('#course_pool').is(':focus')) show_modal_window(schedule);
        });
        key('enter', function () {
            if ($('#course_pool').is(':focus')) show_modal_window(schedule);
        });
        key.filter = ev => true;
    }
}

on_tool_loaded();
