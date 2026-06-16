package com.matchmyuni

import androidx.core.content.FileProvider
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

class FileUriModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "MMFileUri"

  @ReactMethod
  fun getContentUriForFile(fileUri: String, promise: Promise) {
    try {
      val path = fileUri.removePrefix("file://")
      val file = File(path)
      if (!file.exists()) {
        promise.reject("FILE_NOT_FOUND", "File not found: $path")
        return
      }
      val authority = reactApplicationContext.packageName + ".fileprovider"
      val contentUri =
          FileProvider.getUriForFile(reactApplicationContext, authority, file)
      promise.resolve(contentUri.toString())
    } catch (e: Exception) {
      promise.reject("FILE_URI_ERROR", e.message, e)
    }
  }
}
