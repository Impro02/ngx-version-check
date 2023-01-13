import { LoggerService } from '@alphaa/services/logger.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { catchError, interval, Subscription, throwError } from 'rxjs';

export interface IVersionCheck {
    /** (Optional) The notification method to call from the client if there is a new version available. */
    notification?: any;

    /** (Required) The frequency in milliseconds (defaults to 30 minutes). */
    frequency: number;
}

@Injectable()
export class VersionCheckService {
    // These will be replaced by the post-build.js script
    private _currentDate: string;
    private _currentHash: string;
    private _version: string;

    // Private properties
    private newVersionAvailable: boolean = false;
    private versionCheckInterval: Subscription;

    constructor(private http: HttpClient, private readonly _loggerService: LoggerService) {}

    /** Will do the call and check if the hash has changed or not. */
    public checkVersion(notification: any) {
        // Timestamp these requests to invalidate caches

        return this.http
            .get('version.json', { params: { t: new Date().getTime() } })
            .pipe(
                catchError(error => {
                    this._loggerService.error('Error checking version');
                    return throwError(() => new Error(error));
                }),
            )
            .subscribe((response: any) => {
                this.newVersionAvailable = this.hasHashChanged(this._currentHash, response.hash);

                // Stop checking for a new version if a new version is already available
                if (this.newVersionAvailable) {
                    this.stopVersionChecking();

                    // Call the consuming client's notification method if one exists
                    if (notification) notification();
                }
            });
    }

    /**
     * Starts the version check interval for the specified frequency.
     * @param config The configuration parameters for the notification function and version check frequency.
     */
    public startVersionChecking(config: IVersionCheck = { notification: null, frequency: 1800000 }) {
        this.versionCheckInterval = interval(config.frequency).subscribe(() => {
            this.checkVersion(config.notification);
        });
    }

    /** Stops the version check interval. */
    public stopVersionChecking() {
        this.versionCheckInterval.unsubscribe();
    }

    /**
     * Checks if hash has changed.
     * This file has the JS hash, if it is a different one than in the version.json
     * we are dealing with version change
     * @param currentHash The current hash of the application.
     * @param newHash The new application hash from the version.json file.
     * @returns Boolean value determining if the hash has changed between the application and version.json file.
     */
    private hasHashChanged(currentHash: string, newHash: string): boolean {
        return currentHash !== newHash;
    }

    /** The current build date of the application */
    set Date(date: string) {
        this._currentDate = date;
    }

    /** The current build hash of the application */
    set Hash(hash: string) {
        this._currentHash = hash;
    }

    /** The current version number of the application */
    set Version(version: string) {
        this._version = version;
    }

    /** The current build hash of the application */
    get Hash(): string {
        return this._currentHash;
    }

    /** The current build date of the application */
    get Date(): string {
        return this._currentDate;
    }

    /** The current version number of the application */
    get Version(): string {
        return this._version;
    }

    /** Flag showing if a new version of the application is available. */
    get NewVersionAvailable(): boolean {
        return this.newVersionAvailable;
    }
}
