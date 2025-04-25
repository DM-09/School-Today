function getV(key) {
  return window.localStorage.getItem(key)
}

function setV(k, v) {
  window.localStorage.setItem(k, v)
}

function save() {
  var keys = ['code', 'hak', 'ban']
  for (var key of keys) {
    setV(key, document.querySelector('#'+key).value)
  }
  var V = document.querySelector('#edu').value;
  setV('edu', V)
  alert('저장되었습니다. 메인 화면으로 돌아갑니다.')
  location.href = '/'
}

window.onload = function() {
  var keys = ['code', 'hak', 'ban']
  var defalt = {'code' : '', 'hak' : 1, 'ban' : 1}

  for (var key of keys) {
    var V = getV(key)
    if (!V) { V = defalt[key] }
    document.querySelector('#'+key).value = V
  }
  
  var e_code = 'Z00'
  if (getV('edu')) { e_code = getV('edu') }
  
  let stag = document.getElementById("edu");
  for (let op of stag.options) {
    if (op.value == e_code) {
      op.selected = true; break
    }
  }
}
