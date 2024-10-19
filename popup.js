let interval;
let isRunning = false;
let currentTimer = 1500; // Tiempo por defecto en segundos (25 minutos)
let currentPomodoro = 0; // Índice del Pomodoro actual
let pomodoroTitle = ""; // Título del Pomodoro actual

// Iniciar el Pomodoro
document.getElementById('startPomodoro').addEventListener('click', () => {
  if (!isRunning) {
    pomodoroTitle = document.getElementById('pomodoroTitle').value || "Sin título"; // Capturar el título o poner "Sin título"
    
    // Obtener los tiempos personalizados de trabajo y descanso
    chrome.storage.local.get(['workTime', 'breakTime', 'pomodoroHistory'], (result) => {
      const workTimeInMinutes = result.workTime || 25; // Usar 25 por defecto si no está definido
      currentTimer = workTimeInMinutes * 60; // Convertir minutos a segundos
      currentTimer = 2;
      changeToWorkMode(); // Cambiar a modo de trabajo (verde)
      document.getElementById('status').textContent = "En curso"; // Cambiar estado a "En curso"
      chrome.runtime.sendMessage({ action: "startPomodoro", title: pomodoroTitle });
      startTimer();
    });
  }
});

// Función para detener el Pomodoro
document.getElementById('stopPomodoro').addEventListener('click', () => {
  clearInterval(interval);
  isRunning = false;
  document.getElementById('status').textContent = "Detenido"; // Cambiar estado a "Detenido"
});

// Función para reiniciar el Pomodoro
document.getElementById('resetPomodoro').addEventListener('click', () => {
  clearInterval(interval);
  chrome.storage.local.get(['workTime'], (result) => {
    const workTimeInMinutes = result.workTime || 25; // Usar 25 por defecto si no está definido
    currentTimer = workTimeInMinutes * 60; // Reiniciar con el tiempo guardado
    document.getElementById('timeDisplay').textContent = `${workTimeInMinutes}:00`;
    changeToWorkMode(); // Cambiar a modo de trabajo (verde)
  });
  document.getElementById('status').textContent = "Reiniciado"; // Cambiar estado a "Reiniciado"
  isRunning = false;
});

// Función para iniciar el temporizador
function startTimer() {
  isRunning = true;
  interval = setInterval(() => {
    if (currentTimer > 0) {
      currentTimer--;
      updateTimeDisplay();
    } else {
      clearInterval(interval);
      isRunning = false;
      updatePomodoroCycles(); // Actualizar el ciclo completado en el historial
      showBreakButton(); // Mostrar el botón de descanso al finalizar el trabajo
    }
  }, 1000);
}

// Función para actualizar la pantalla del temporizador
function updateTimeDisplay() {
  const minutes = Math.floor(currentTimer / 60);
  const seconds = currentTimer % 60;
  document.getElementById('timeDisplay').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Actualizar el número de ciclos de Pomodoros completados y guardar el título correspondiente
function updatePomodoroCycles() {
  chrome.storage.local.get({ pomodoroCycles: 0, pomodoroHistory: [] }, (result) => {
    const newCycleCount = result.pomodoroCycles + 1;
    const updatedHistory = [...result.pomodoroHistory, { title: pomodoroTitle || "Sin título" }];

    // Actualizar el número de ciclos y guardar el historial
    chrome.storage.local.set({ pomodoroCycles: newCycleCount, pomodoroHistory: updatedHistory }, () => {
      updateHistory(newCycleCount, updatedHistory); // Actualizar el historial de Pomodoros
    });
  });
}

// Función para mostrar el historial de Pomodoros completados
function updateHistory(cycles, history) {
  const historyList = document.getElementById('historyList');
  historyList.innerHTML = ''; // Limpiar el historial anterior antes de actualizarlo

  for (let i = 0; i < history.length; i++) {
    const listItem = document.createElement('li');
    listItem.textContent = `Pomodoro ${i + 1}: ${history[i].title}`; // Mostrar el título de cada Pomodoro
    historyList.appendChild(listItem);
  }
}

// Mostrar el botón de "Descanso" al finalizar el trabajo
function showBreakButton() {
  const existingBreakButton = document.getElementById('breakButton');
  if (existingBreakButton) return; // Evitar mostrar múltiples botones de descanso

  const breakButton = document.createElement('button');
  breakButton.textContent = "Descanso";
  breakButton.id = "breakButton";
  breakButton.style.backgroundColor = "#2196F3"; // Botón azul para descanso
  breakButton.style.color = "white";
  breakButton.style.border = "none";
  breakButton.style.padding = "10px";
  breakButton.style.marginTop = "10px";
  breakButton.style.fontSize = "16px";
  breakButton.style.cursor = "pointer";
  document.body.appendChild(breakButton);

  // Al hacer clic en el botón, cambiar a modo de descanso
  breakButton.addEventListener('click', () => {
    changeToBreakMode(); // Cambiar el color de la interfaz a azul
    startBreakTimer(); // Iniciar el temporizador de descanso
    document.body.removeChild(breakButton); // Eliminar el botón de descanso una vez que se haya hecho clic
  });
}

// Función para iniciar el temporizador de descanso
function startBreakTimer() {
  chrome.storage.local.get(['breakTime'], (result) => {
    currentTimer = (result.breakTime || 5) * 60; // Obtener tiempo de descanso
    document.getElementById('status').textContent = "Tiempo de descanso"; // Cambiar estado a "Tiempo de descanso"
    startTimer(); // Iniciar el temporizador de descanso
  });
}

// Función para cambiar a modo de trabajo (verde)
function changeToWorkMode() {
  document.body.style.backgroundColor = "#DFF2BF"; // Fondo verde claro
  document.getElementById('status').style.color = "#4CAF50"; // Texto verde
  document.querySelectorAll('button').forEach(button => {
    button.style.backgroundColor = "#4CAF50"; // Botones en verde
  });
  document.querySelector('h1').style.color = "#4CAF50"; // Cambiar el color del título (h1) a verde
}

// Función para cambiar a modo de descanso (azul)
function changeToBreakMode() {
  document.body.style.backgroundColor = "#ADD8E6"; // Fondo azul claro
  document.getElementById('status').style.color = "#2196F3"; // Texto azul
  document.querySelectorAll('button').forEach(button => {
    button.style.backgroundColor = "#2196F3"; // Botones en azul
  });
  document.querySelector('h1').style.color = "#2196F3"; // Cambiar el color del título (h1) a azul
}

// Función para eliminar el historial de Pomodoros
document.getElementById('clearHistory').addEventListener('click', () => {
  chrome.storage.local.set({ pomodoroCycles: 0, pomodoroHistory: [] }, () => {
    updateHistory(0, []); // Limpiar el historial en la interfaz
    document.getElementById('cycleCount').textContent = "Ciclos completados: 0"; // Actualizar el contador de ciclos
  });
});

// Al cargar la página, actualizar el historial de ciclos completados
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get({ pomodoroCycles: 0, pomodoroHistory: [] }, (result) => {
    updateHistory(result.pomodoroCycles, result.pomodoroHistory); // Actualizar el historial cuando la página cargue
    document.getElementById('cycleCount').textContent = `Ciclos completados: ${result.pomodoroCycles}`; // Mostrar el número de ciclos completados
  });
});
