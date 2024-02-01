This project is a fork of ngx-version-check, which is an injectable Angular 8+ service for monitoring and notifying users of a new application version.

## Usage Instructions

In your angular.json file, add the library's assets folder to the assets array:

```
"assets": [
    "src/favicon.ico",
    "src/assets",
    {
        "glob": "**/*",
        "input": "src/ngx-version-checker/assets",
        "output": "/"
    }
],
```

In your AppModule, make sure you are importing the `HttpClientModule`.

```
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

In the component you want to use for starting the service, inject the service in the constructor, and start it (with the configuration or with defaults) in the ngOnInit (or another) method:

```
import { VersionCheckService } from 'ngx-version-checker/service/version-check.service';
```

```

constructor(private versionCheckService: VersionCheckService) {}

ngOnInit() {
  fetch('/version.json')
    .then(response => response.json())
    .then(data => {
        console.log(data);

        this._versionCheckService.Date = data.date;
        this._versionCheckService.Hash = data.hash;

        this._versionCheckService.startVersionChecking({
            frequency: 300000,
            notification: this.versionCheckedHandler,
        });
    })
    .catch(error => console.error(error));
}

versionCheckedHandler() {
  // Handle how you want to display the notification to your users
  // This method will be called by the service when a new version is available
}
```

You can also use the service to display the version and build hash in your application as well. You can do this by making the service injection public, and using the following properties in your template:

**Hash**: The build hash of the application.

**Version**: The version number of the application.

### Available Methods

**startVersionChecking()**: Starts the version check service interval with the specified configuration.

**stopVersionChecking()**: Stops the version check service interval.

### Configuration

**frequency**: (Defaults to 1800000 [30mins]) The time (in milliseconds) to wait between checks.
**notification**: (Optional) The method that handles the notification to the user that a new version is available.

## Build Requirements

In order for the version check service to function, a post build script needs to be run after compiling your angular application so that the correct values are available to the service. The library's assets folder contains a file named `version.json` which is what will get read by the service. In your main `package.json` file, you will need a script, prefixed with `post`, to trigger the post build script, followed by a parameter, which is just the name of your project:

```
{
    "name": "app",
    "scripts": {
        "postbuild": "node src/ngx-version-checker/build/post-build.js app"
    }
},
```

Note: The name of your post build script should be whatever you're using to trigger the build (ie. If your build script was named `buildmyproject`, your post built script would be `postbuildmyproject`).
