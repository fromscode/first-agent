export default function(maintenanceCalories = 2200, deficitPercentage = 15.0) {
    const result = maintenanceCalories * (1- deficitPercentage / 100);
    return result
}