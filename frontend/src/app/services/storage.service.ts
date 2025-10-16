import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';

@Injectable({ providedIn: 'root' })
export class StorageService {
    private _storageReady: Promise<Storage>;
    private _storage: Storage | null = null;

    constructor(private storage: Storage) {
        this._storageReady = this.init();
    }

    private async init(): Promise<Storage> {
        if (!this._storage) {
            await this.storage.defineDriver(CordovaSQLiteDriver);
            const storage = await this.storage.create();
            this._storage = storage;
        }
        return this._storage!;
    }

    async set(key: string, value: any) {
        const store = await this._storageReady;
        return store.set(key, value);
    }

    async get<T>(key: string): Promise<T | null> {
        const store = await this._storageReady;
        return store.get(key);
    }

    async remove(key: string) {
        const store = await this._storageReady;
        return store.remove(key);
    }

    async clear() {
        const store = await this._storageReady;
        return store.clear();
    }
}
