function getV(key) {
  return window.localStorage.getItem(key)
}

function setV(k, v) {
  window.localStorage.setItem(k, v)
}

function autoFill(y, m, d) {
  var hyear = y
  var sem = 1
  if (m < 3) { hyear -= 1 }
  if ((m > 8) || (m == 8 && d >= 15)) { sem = 2 }
  return [hyear, sem]
}

function gen_date(d) {
  var txt = ''
  txt += d.getFullYear() + '-'
  txt += String(d.getMonth()+1).padStart(2,'0') + '-'
  txt += String(d.getDate()).padStart(2,'0')
  return txt
}

function gen_txt(s) {
  var d = new Date()
  if (s == gen_date(d)) {
    return '오늘'
  }
  
  d.setDate(d.getDate() - 1)
  if (s == gen_date(d)) {
    return '어제'
  }
 
  d.setDate(d.getDate() + 2)
  if (s == gen_date(d)) {
    return '내일'
  }
  
  var sel = s.split('-')
  var txt = sel[0]+'년 '+sel[1]+'월 '+sel[2]+'일의 '
  return txt
}

function getAPI(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';

    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      } else {
        reject(new Error(`Request failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = function() {
      reject(new Error('Network error'));
    };

    xhr.send();
  });
}


function getBab() {
  var api = `/api/food?edu=${getV('edu')}&code=${getV('code')}&ymd=${getV('ymd')}`
  var el = document.querySelector('#bab')
  getAPI(api)
   .then(res =>
     el.innerHTML = res['res']
   )
   .catch(error => console.error(error));
  
}

function getHaksa() {
  var api = `/api/hak?edu=${getV('edu')}&code=${getV('code')}&ymd=${getV('ymd')}`
  var el = document.querySelector('#haksa')
  getAPI(api)
   .then(res =>
     el.innerHTML = res['res']
   )
   .catch(error => console.error(error));
}

function getHhak() {
  if (!getV('hhak')) { return }
  var api = `/api/hhak?name=${getV('hhak')}&month=${getV('ymd').slice(0,-2)}&ymd=${getV('ymd')}`
  var ele = document.querySelector('#hhak')
  $('#hhak').html('<div class="text-secondary">불러오는 중</div>')
  getAPI(api)
   .then(res =>
     ele.innerHTML = res['res']
   )
   .catch(error => console.error(error));
}

function make_table(data) {
  if (!data) { return '-' }
  
  var select_sec = ''
  var cur_table = ''
  var my = `${getV('hak')}-${getV('ban')}`
  
  console.log(data)
  datab = data
  
  for (var info of Object.keys(data)) {
    var more = ''
    if (info == my) { more = 'selected' }
    select_sec += `<option value="${info}" ${more}>${info}</option>`
  }
  
  if (!data[my]) { cur_table = '<div class="text-secondary">Error</div>' }
  else {
   for (var a of data[my]) {
    cur_table += a + ' <br>'
   } 
  }
  
  var html = `
    <select id="hakban" class='c-el mt-2' onchange='load_data(this)'>
       ${select_sec}
    </select>
    <div class='mt-2' id='cur_table'>
        ${cur_table}
    </div>`
  
  return html
}

var datab = []

function getTimeTable(v) {
  var api = `/api/table?edu=${getV('edu')}&code=${getV('code')}&ymd=${getV('ymd')}&hyear=${v[0]}&sem=${v[1]}`
  var el = document.querySelector('#time')
  getAPI(api)
   .then(res =>
     document.querySelector('#time').innerHTML = make_table(res['res'])
   )
   .catch(error => console.error(error));
}

function load_data(e) {
  var el = document.querySelector('#cur_table')
  var cur_table = ''

  for (var a of datab[e.value]) {
    cur_table += a + ' <br>'
  }
  
  el.innerHTML = cur_table
}

function init(e) {
  var a = e.split('-')
  var v = autoFill(Number(a[0]), Number(a[1]), Number(a[2]))
  var load = '<div class="text-secondary">불러오는 중</div>'
  $('#haksa').html(load)
  $('#time').html(load)
  $('#bab').html(load)
  $('#hhak').html('')
  getTimeTable(v)
  getHaksa()
  getBab()
  getHhak()
}

window.onload = function() {
  var keys = ['code', 'hak', 'ban']
  var vals = {'code': '', 'hak' : 1, 'ban' : 1}
  for (var key of keys) {
    var V = getV(key)
    if (V) { vals[key] = V }
    else { setV(key, vals[key]) }
  }
  
  var now = new Date()
  var d = now.getFullYear()+ String(now.getMonth()+1).padStart(2,'0')+ String(now.getDate()).padStart(2,'0')
  setV('ymd', d)
  
  if (vals['code'] == '') { location.href = '/setting' } 
  else { init(getV('ymd')) }
  
  $('#ymd').datepicker({
    format: 'yyyy-mm-dd',
    language: 'ko',
    autoclose: true,
    todayHighlight: true
    
  }).on('changeDate', function(e) {
    var s = e.format()
    setV('ymd', s.replaceAll('-', ''))
    $('#day_txt').html(gen_txt(s))
    init(s)
  });
}

function PickDate() {
  $('#ymd').datepicker('show');
}
