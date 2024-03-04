// start '2024-03-01T00:00:00'
// end '2024-03-04T00:00:00'
function generateRandomDate(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffDate = endDate - startDate;
    let randomTimestamp = startDate.getTime() + Math.random() * diffDate;
    let ramdomTime = new Date(randomTimestamp);
    if (Math.random() < 0.75 || ramdomTime.getDate() === 1 || ramdomTime.getDate() === 2) {
        let hour = 14 + Math.floor(Math.random() * 10); 
        let minutes = Math.floor(Math.random() * 60);
        ramdomTime.setHours(hour, minutes, 0, 0);
    } else {
        let hour = Math.floor(Math.random() * 4);
        let minutes = Math.floor(Math.random() * 60);
        ramdomTime.setHours(hour, minutes, 0, 0);
    }
    return ramdomTime;
  }

  function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
}

  module.exports = { generateRandomDate, addMinutes };
  