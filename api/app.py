import requests
from flask import Flask, request, jsonify, render_template, url_for
from flask_cors import CORS
from collections import defaultdict as dd

app = Flask(__name__)
CORS(app)

def req(api):
  url = 'https://dm-api-sigma.vercel.app/api/get/neis?r='
  return requests.get(url+api).json()

@app.route('/api/table')
def get_table():
  r = request.args
  edu = r.get('edu', 0) # 시도 교육청 코드
  code = r.get('code', 0) # 행정 표준 코드
  ymd = r.get('ymd') # 년월일
  hyear = r.get('hyear') # 학년도
  sem = r.get('sem', 1) # 학기

  if edu == 0 or code == 0: return jsonify({'res' : 'Error'}) # 필수 사항 없을 때 에러
  api = f'https://open.neis.go.kr/hub/hisTimetable?KEY={{KEY}}&Type=json&pIndex=1&pSize=1000&ATPT_OFCDC_SC_CODE={edu}&SD_SCHUL_CODE={code}&AY={hyear}&SEM={sem}&ALL_TI_YMD={ymd}'

  try: base = req(api)['hisTimetable'][1]['row']
  except: return ['-', '-']

  class_data = dd(list)

  for i in base:
    if i['CLASS_NM'] == None: continue
    class_name = str(i['GRADE'])+'-'+i['CLASS_NM']
    content = str(i['PERIO'])+'교시 - '+str(i['ITRT_CNTNT'])
    class_data[class_name].append(content)

  for i in class_data: class_data[i].sort()
  return jsonify({'res' : class_data})

@app.route('/api/food')
def get_bob():
  r = request.args
  edu = r.get('edu', 0) # 시도 교육청 코드
  code = r.get('code', 0) # 행정 표준 코드
  ymd = r.get('ymd') # 년월일

  if edu == 0 or code == 0: return jsonify({'res' : 'Error'}) # 필수 사항 없을 때 에러
  api = f'https://open.neis.go.kr/hub/mealServiceDietInfo?ATPT_OFCDC_SC_CODE={edu}&SD_SCHUL_CODE={code}&MLSV_YMD={ymd}&Type=json&KEY={{KEY}}'
  try: return jsonify({'res': req(api)['mealServiceDietInfo'][1]['row'][0]['DDISH_NM']})
  except: return jsonify({'res' : '-'})

@app.route('/api/hak')
def get_haksa():
  r = request.args
  edu = r.get('edu', 0) # 시도 교육청 코드
  code = r.get('code', 0) # 행정 표준 코드
  ymd = r.get('ymd') # 년월일

  if edu == 0 or code == 0: return jsonify({'res' : 'Error'})  # 필수 사항 없을 때 에러
  api = f'https://open.neis.go.kr/hub/SchoolSchedule?ATPT_OFCDC_SC_CODE={edu}&SD_SCHUL_CODE={code}&AA_YMD={ymd}&Type=json&KEY={{KEY}}'
  s = []
  try:
    res = req(api)['SchoolSchedule'][1]['row']
    for i in res: s.append(i['EVENT_NM'])
  except: return jsonify({'res' : '-'})
  return jsonify({'res': '\n'.join(s)})

@app.route('/api/hhak')
def get_haksa_from_school():
  r = request.args
  hname = r.get('name')
  month = r.get('month')
  ymd = r.get('ymd')
  s = requests.get(f'https://{hname}.goesw.kr/').text
  code = ''

  for i in s.split('subList/'):
    b = i.split('"')
    flag = False
    for j in b:
      if '학사일정' in j: flag = True; break
    if b.count(' data-mnSeq=') and b[0].isnumeric() and flag:
      code = b[0]
      break

  url = f'https://{hname}.goesw.kr/$%7Bprefix%7D/schul/module/outsideApi/calMonEventDataJson.do'
  data = {'eventDe': month, "menuSeq": code}

  req = requests.post(url, data=data).json()
  # newData = {}
  for i in req['cntntsData']:
    if i['eventDe'] == ymd: return {'res' : i['eventNm']+' ◽'}
    # newData[i['eventDe']] = i['eventNm']
  # return newData
  return {'res' : ''}

@app.route('/')
def main():
  return render_template('index.html')

@app.route('/setting')
def setting():
  return render_template('setting.html')

@app.route('/setting/more')
def more_set():
  return render_template('more_set.html')
