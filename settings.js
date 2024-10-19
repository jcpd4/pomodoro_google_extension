let selectedWorkTime = 25;
let selectedBreakTime = 5;

// Guardar el tiempo de trabajo seleccionado
document.querySelectorAll('#workTimeButtons .timeButton').forEach(button => {
  button.addEventListener('click', (e) => {
    document.querySelectorAll('#workTimeButtons .timeButton').forEach(btn => btn.classList.remove('selected'));
    e.target.classList.add('selected');
    selectedWorkTime = parseInt(e.target.dataset.time);
  });
});

// Guardar el tiempo de descanso seleccionado
document.querySelectorAll('#breakTimeButtons .timeButton').forEach(button => {
  button.addEventListener('click', (e) => {
    document.querySelectorAll('#breakTimeButtons .timeButton').forEach(btn => btn.classList.remove('selected'));
    e.target.classList.add('selected');
    selectedBreakTime = parseInt(e.target.dataset.time);
  });
});

// Botón de prueba rápida: Establecer 5 segundos para trabajo y descanso
document.getElementById('testButton').addEventListener('click', () => {
  selectedWorkTime = 0.083; // 5 segundos en minutos
  selectedBreakTime = 0.083; // 5 segundos en minutos
  chrome.storage.local.set({ workTime: selectedWorkTime, breakTime: selectedBreakTime }, () => {
    alert('Modo prueba de 5 segundos activado.');
    chrome.runtime.sendMessage({ action: "reloadSettings" }); // Recargar valores en popup.js
  });
});

// Guardar los ajustes seleccionados
document.getElementById('saveSettings').addEventListener('click', () => {
  chrome.storage.local.set({ workTime: selectedWorkTime, breakTime: selectedBreakTime }, () => {
    alert('Ajustes guardados.');
    chrome.runtime.sendMessage({ action: "reloadSettings" });
  });
});
