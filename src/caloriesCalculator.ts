export default function(maintenanceCalories = 2200, deficitPercentage = 15.0) {
    console.log(`Executing calories calculator with maintenance of ${maintenanceCalories} and deficit of ${deficitPercentage} %`);
    const result = maintenanceCalories * (1- deficitPercentage / 100);
    console.log("Result : " + result)
    return result
}