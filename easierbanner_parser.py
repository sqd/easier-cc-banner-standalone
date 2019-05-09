import sys
import json
import traceback
from functools import reduce
from bs4 import BeautifulSoup
from bs4.element import Tag

def main():
    soup = BeautifulSoup(sys.stdin.read(), 'html.parser')

    courses = []
    for tr in soup.find_all('tr'):
        result = try_parse_course(tr)
        if result is not None:
            courses.append(result)
    
    output = dict()
    for course in courses:
        course_no = course['course_no']
        if course_no not in output:
            output[course_no] = list()
        output[course_no].append(course)

    sys.stdout.write(json.dumps(output))

def try_parse_course(tr):
    try:
        tds = []
        for td in tr.contents:
            if type(td) == Tag:
                tds.append(td)
        course = {
            "course_no": tds[2].a.string,
            "course_title": reduce(
                lambda x, y: x + ' ' + y,
                tds[3].stripped_strings),
            "block": int(tds[4].string),
            "instructor": tds[8].string,
            "limit": int(tds[9].string),
            "reserved": int(tds[10].string),
            "available": int(tds[12].string),
            "waitlist": int(tds[13].string)
        }
        return course
    except Exception as e:
        sys.stderr.write('>>>>>>>>>\n')
        traceback.print_exc()
        sys.stderr.write(str(tr) + '\n')
        sys.stderr.write('<<<<<<<<<\n')
        return None


if __name__ == "__main__":
    main()
