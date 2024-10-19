let isWorking = false;
let currentTitle = "";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startPomodoro") {
    currentTitle = message.title; // Capturar el título del Pomodoro

    // Obtener los tiempos de trabajo y descanso personalizados desde chrome.storage
    chrome.storage.local.get({ workTime: 25, breakTime: 5 }, (result) => {
      const workTimeInMinutes = result.workTime || 25; // Usar 25 por defecto si no está definido
      const breakTimeInMinutes = result.breakTime || 5;  // Usar 5 por defecto si no está definido

      workTime = workTimeInMinutes * 60 * 1000; // Convertir a milisegundos
      breakTime = breakTimeInMinutes * 60 * 1000;
      startPomodoro();
    });
  }
});

function startPomodoro() {
  isWorking = true;
  chrome.alarms.create("pomodoroWork", { delayInMinutes: workTime / (60 * 1000) });

  chrome.storage.local.get({ pomodoroCycles: 0 }, (result) => {
    let cycles = result.pomodoroCycles;
    chrome.storage.local.set({ pomodoroCycles: cycles + 1 }, () => {
      chrome.runtime.sendMessage({ action: "updateCycles", cycles: cycles + 1 });
    });
  });

  updateStatus("Trabajando");
  notifyUser("Tiempo de trabajar", `Pomodoro iniciado (${currentTitle})`);
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "pomodoroWork" && isWorking) {
    isWorking = false;
    chrome.runtime.sendMessage({ action: "startBreak" }); // Enviar mensaje para iniciar el descanso
    chrome.alarms.create("pomodoroBreak", { delayInMinutes: breakTime / (60 * 1000) });
    updateStatus("Descansando");
    notifyUser("Tiempo de descansar", "Tómate un descanso.");
  } else if (alarm.name === "pomodoroBreak" && !isWorking) {
    isWorking = true;
    chrome.alarms.create("pomodoroWork", { delayInMinutes: workTime / (60 * 1000) });
    updateStatus("Trabajando");
    notifyUser("Tiempo de trabajar", `Pomodoro reiniciado (${currentTitle})`);
  }
});
