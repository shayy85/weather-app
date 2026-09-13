<?php
// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

//Declaring Variable
$host="localhost";
$username="root";
$password="";

//Connection generating
$conn=mysqli_connect($host, $username, $password);
if (!$conn){
    echo json_encode(["error" => "Connection failed"]);
    exit;
}

//Create Database
$sql="CREATE DATABASE IF NOT EXISTS weather_app";
if(!mysqli_query($conn, $sql)){
    echo json_encode(["error" => "Database creation failed"]);
    exit;
}

//Selecting the Database
mysqli_select_db($conn, "weather_app");

//Creating table in Database
$table="CREATE TABLE IF NOT EXISTS weather_data(
    id INT PRIMARY KEY AUTO_INCREMENT,
    city VARCHAR(100) NOT NULL,
    temperature DECIMAL(5,2),
    weather_description VARCHAR(255),
    humidity INT,
    wind_speed DECIMAL(5,2),
    wind_direction VARCHAR(10),
    pressure DECIMAL(7,2),
    weather_date DATETIME
);";
mysqli_query($conn, $table);

// Handle POST request (saving data)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if ($input) {
        $city = mysqli_real_escape_string($conn, $input['city']);
        $temperature = mysqli_real_escape_string($conn, $input['temperature']);
        $weather_description = mysqli_real_escape_string($conn, $input['weather_description']);
        $humidity = mysqli_real_escape_string($conn, $input['humidity']);
        $wind_speed = mysqli_real_escape_string($conn, $input['wind_speed']);
        $wind_direction = mysqli_real_escape_string($conn, $input['wind_direction']);
        $pressure = mysqli_real_escape_string($conn, $input['pressure']);
        
        $select="SELECT * FROM weather_data 
                 WHERE city ='$city' 
                 AND weather_date >= NOW() - INTERVAL 2 HOUR";
        $result=mysqli_query($conn, $select);
        
        if(mysqli_num_rows($result)==0){
            $insert="INSERT INTO weather_data 
            (city, temperature, weather_description, humidity, wind_speed, wind_direction, pressure, weather_date) 
            VALUES 
            ('$city', '$temperature', '$weather_description', '$humidity', '$wind_speed', '$wind_direction', '$pressure', NOW())";
            
            mysqli_query($conn, $insert);
        }
        
        echo json_encode(["success" => true]);
    }
    exit;
}

// Handle GET request (fetching data)
if(isset($_GET["q"])){
    $cityname=$_GET["q"];
}else{
    $cityname="Coventry";
}

//Fetching API Data
$cityname=urlencode($cityname);
$response=file_get_contents("YOUR_WEBPAGE_LINK_WITH_API");
$data=json_decode($response, true);

// Return the API data as JSON
echo json_encode($data);

mysqli_close($conn);
?>
