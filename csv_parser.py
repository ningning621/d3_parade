import csv
from dateutil.parser import parse
import re

datetime = parse('2018-06-29 22:21:41')

data = []
header = []

with open('C:\\Users\\ningn\\workspace\\d3_parade\\git_data_original.csv', encoding="utf8") as f:
    reader = csv.DictReader(f)

    header = ["year", "month", "date", "author", "subject", "repo", "insertions", "deletions"]
    count = 0

    temp_list = []

    for row in reader:
        temp_obj = {}

        # parse date
        datetime = parse(row["date"])
        temp_obj["year"] = datetime.year
        temp_obj["month"] = datetime.month
        temp_obj["date"] = datetime.day

        # copy over author + repo info
        temp_obj["author"] = row["author"]
        temp_obj["repo"] = row["repo"]
        temp_obj["subject"] = row["subject"]

        # get num of lines changed
        change_arr = re.findall(r'\d+ insertion', row["body"])
        temp_obj["insertions"] = 0 if len(change_arr) == 0 else (change_arr[0].split(" "))[0]
        change_arr = re.findall(r'\d+ deletion', row["body"])
        temp_obj["deletions"] = 0 if len(change_arr) == 0 else (change_arr[0].split(" "))[0]

        temp_list.append(temp_obj)

    data = temp_list

with open('C:\\Users\\ningn\\workspace\\d3_parade\\git_data_filtered.csv', 'w', encoding="utf8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=header)
    writer.writeheader()
    writer.writerows(data)

