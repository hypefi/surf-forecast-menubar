import CoreLocation

class MyLocationManager: NSObject, CLLocationManagerDelegate {
    let manager = CLLocationManager()
    var locationCallback: ((CLLocation) -> Void)?

    override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyBest
        manager.requestLocation() // Request location once
    }

    func fetchLocation(completion: @escaping (CLLocation) -> Void) {
        self.locationCallback = completion
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        if let location = locations.first {
            locationCallback?(location)
            manager.stopUpdatingLocation() // stop updating location after getting the first location
        }
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Failed to find user's location: \(error.localizedDescription)")
    }
}

let myLocationManager = MyLocationManager()
myLocationManager.fetchLocation { location in
    print("location:: \(location.coordinate)")
}
RunLoop.main.run()
