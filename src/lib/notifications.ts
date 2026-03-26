export async function requestNotifications() {
  if (!('Notification' in window)) {
    alert("Ce navigateur ne supporte pas les notifications.");
    return;
  }
  
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    new Notification("QuartierSecure", {
      body: "Vous recevrez désormais les alertes importantes.",
      icon: "/icon-192.png",
    });
  }
}
