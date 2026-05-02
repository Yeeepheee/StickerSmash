const {
  withInfoPlist,
  withEntitlementsPlist,
  withXcodeProject,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const WIDGET_TARGET_NAME = "WidgetExtension";
const WIDGET_SOURCE_DIR = path.join(__dirname, "../widget");




function q(str) {
  return `"${str}"`;
}

function generateUuid() {
  return "XXXXXXXXXXXXXXXXXXXXXXXX".replace(/X/g, () =>
    Math.floor(Math.random() * 16).toString(16).toUpperCase()
  );
}

function addWidgetExtensionTarget(project, appGroupId, bundleId) {
  const widgetBundleId = `${bundleId}.widget`;
  const objects = project.hash.project.objects;

  
  objects["XCBuildConfiguration"] = objects["XCBuildConfiguration"] || {};
  objects["XCConfigurationList"] = objects["XCConfigurationList"] || {};
  objects["PBXNativeTarget"] = objects["PBXNativeTarget"] || {};
  objects["PBXSourcesBuildPhase"] = objects["PBXSourcesBuildPhase"] || {};
  objects["PBXFrameworksBuildPhase"] = objects["PBXFrameworksBuildPhase"] || {};
  objects["PBXResourcesBuildPhase"] = objects["PBXResourcesBuildPhase"] || {};
  objects["PBXCopyFilesBuildPhase"] = objects["PBXCopyFilesBuildPhase"] || {};
  objects["PBXFileReference"] = objects["PBXFileReference"] || {};
  objects["PBXBuildFile"] = objects["PBXBuildFile"] || {};
  objects["PBXGroup"] = objects["PBXGroup"] || {};

  const targetUuid = generateUuid();
  const configListUuid = generateUuid();
  const debugUuid = generateUuid();
  const releaseUuid = generateUuid();
  const sourcesBuildPhaseUuid = generateUuid();
  const frameworksBuildPhaseUuid = generateUuid();
  const resourcesBuildPhaseUuid = generateUuid();

  
  
  const buildSettings = {
    ALWAYS_SEARCH_USER_PATHS: "NO",
    CLANG_ENABLE_MODULES: "YES",
    CURRENT_PROJECT_VERSION: "1",
    GENERATE_INFOPLIST_FILE: "NO",
    INFOPLIST_FILE: q(`${WIDGET_TARGET_NAME}/Info.plist`),
    CODE_SIGN_ENTITLEMENTS: q(`${WIDGET_TARGET_NAME}/${WIDGET_TARGET_NAME}.entitlements`),
    MARKETING_VERSION: "1.0",
    PRODUCT_BUNDLE_IDENTIFIER: widgetBundleId,
    PRODUCT_NAME: q(WIDGET_TARGET_NAME),
    SKIP_INSTALL: "YES",
    SWIFT_EMIT_LOC_STRINGS: "YES",
    SWIFT_VERSION: "5.0",
    TARGETED_DEVICE_FAMILY: q("1,2"), 
    IPHONEOS_DEPLOYMENT_TARGET: "16.0",
  };

  
  objects["XCBuildConfiguration"][debugUuid] = {
    isa: "XCBuildConfiguration",
    buildSettings: { ...buildSettings, DEBUG_INFORMATION_FORMAT: "dwarf" },
    name: "Debug",
  };
  objects["XCBuildConfiguration"][`${debugUuid}_comment`] = "Debug";

  objects["XCBuildConfiguration"][releaseUuid] = {
    isa: "XCBuildConfiguration",
    buildSettings: {
      ...buildSettings,
      DEBUG_INFORMATION_FORMAT: q("dwarf-with-dsym"),
    },
    name: "Release",
  };
  objects["XCBuildConfiguration"][`${releaseUuid}_comment`] = "Release";

  
  objects["XCConfigurationList"][configListUuid] = {
    isa: "XCConfigurationList",
    buildConfigurations: [
      { value: debugUuid, comment: "Debug" },
      { value: releaseUuid, comment: "Release" },
    ],
    defaultConfigurationIsVisible: 0,
    defaultConfigurationName: "Release",
  };
  objects["XCConfigurationList"][`${configListUuid}_comment`] =
    `Build configuration list for PBXNativeTarget "${WIDGET_TARGET_NAME}"`;

  
  const widgetFiles = fs
    .readdirSync(WIDGET_SOURCE_DIR)
    .filter((f) => f.endsWith(".swift"));
  const allSourceFiles = [...widgetFiles, "WidgetConfig.swift"];

  const sourceFiles = allSourceFiles.map((file) => {
    const fileRefUuid = generateUuid();
    const buildFileUuid = generateUuid();

    objects["PBXFileReference"][fileRefUuid] = {
      isa: "PBXFileReference",
      lastKnownFileType: "sourcecode.swift",
      name: q(file),
      path: q(file),  
      sourceTree: q("<group>"),
    };
    objects["PBXFileReference"][`${fileRefUuid}_comment`] = file;

    objects["PBXBuildFile"][buildFileUuid] = {
      isa: "PBXBuildFile",
      fileRef: fileRefUuid,
    };
    objects["PBXBuildFile"][`${buildFileUuid}_comment`] = `${file} in Sources`;

    return { fileRefUuid, buildFileUuid, file };
  });

  objects["PBXSourcesBuildPhase"][sourcesBuildPhaseUuid] = {
    isa: "PBXSourcesBuildPhase",
    buildActionMask: 2147483647,
    files: sourceFiles.map(({ buildFileUuid, file }) => ({
      value: buildFileUuid,
      comment: `${file} in Sources`,
    })),
    runOnlyForDeploymentPostprocessing: 0,
  };
  objects["PBXSourcesBuildPhase"][`${sourcesBuildPhaseUuid}_comment`] = "Sources";

  
  const widgetKitRefUuid = generateUuid();
  const swiftUIRefUuid = generateUuid();
  const widgetKitBuildUuid = generateUuid();
  const swiftUIBuildUuid = generateUuid();

  objects["PBXFileReference"][widgetKitRefUuid] = {
    isa: "PBXFileReference",
    lastKnownFileType: "wrapper.framework",
    name: q("WidgetKit.framework"),
    path: q("System/Library/Frameworks/WidgetKit.framework"),
    sourceTree: q("SDKROOT"),
  };
  objects["PBXFileReference"][`${widgetKitRefUuid}_comment`] = "WidgetKit.framework";

  objects["PBXFileReference"][swiftUIRefUuid] = {
    isa: "PBXFileReference",
    lastKnownFileType: "wrapper.framework",
    name: q("SwiftUI.framework"),
    path: q("System/Library/Frameworks/SwiftUI.framework"),
    sourceTree: q("SDKROOT"),
  };
  objects["PBXFileReference"][`${swiftUIRefUuid}_comment`] = "SwiftUI.framework";

  objects["PBXBuildFile"][widgetKitBuildUuid] = {
    isa: "PBXBuildFile",
    fileRef: widgetKitRefUuid,
  };
  objects["PBXBuildFile"][`${widgetKitBuildUuid}_comment`] =
    "WidgetKit.framework in Frameworks";

  objects["PBXBuildFile"][swiftUIBuildUuid] = {
    isa: "PBXBuildFile",
    fileRef: swiftUIRefUuid,
  };
  objects["PBXBuildFile"][`${swiftUIBuildUuid}_comment`] =
    "SwiftUI.framework in Frameworks";

  objects["PBXFrameworksBuildPhase"][frameworksBuildPhaseUuid] = {
    isa: "PBXFrameworksBuildPhase",
    buildActionMask: 2147483647,
    files: [
      { value: widgetKitBuildUuid, comment: "WidgetKit.framework in Frameworks" },
      { value: swiftUIBuildUuid, comment: "SwiftUI.framework in Frameworks" },
    ],
    runOnlyForDeploymentPostprocessing: 0,
  };
  objects["PBXFrameworksBuildPhase"][`${frameworksBuildPhaseUuid}_comment`] = "Frameworks";

  
  objects["PBXResourcesBuildPhase"][resourcesBuildPhaseUuid] = {
    isa: "PBXResourcesBuildPhase",
    buildActionMask: 2147483647,
    files: [],
    runOnlyForDeploymentPostprocessing: 0,
  };
  objects["PBXResourcesBuildPhase"][`${resourcesBuildPhaseUuid}_comment`] = "Resources";

  
  objects["PBXNativeTarget"][targetUuid] = {
    isa: "PBXNativeTarget",
    buildConfigurationList: configListUuid,
    buildPhases: [
      { value: sourcesBuildPhaseUuid, comment: "Sources" },
      { value: frameworksBuildPhaseUuid, comment: "Frameworks" },
      { value: resourcesBuildPhaseUuid, comment: "Resources" },
    ],
    buildRules: [],
    dependencies: [],
    name: WIDGET_TARGET_NAME,
    productName: WIDGET_TARGET_NAME,
    productType: q("com.apple.product-type.app-extension"),
  };
  objects["PBXNativeTarget"][`${targetUuid}_comment`] = WIDGET_TARGET_NAME;

  
  const pbxProjectUuid = project.getFirstProject().uuid;
  const pbxProject = objects["PBXProject"][pbxProjectUuid];
  pbxProject.targets.push({ value: targetUuid, comment: WIDGET_TARGET_NAME });

  
  const productRefUuid = generateUuid();
  const embedBuildFileUuid = generateUuid();
  const embedPhaseUuid = generateUuid();

  objects["PBXFileReference"][productRefUuid] = {
    isa: "PBXFileReference",
    explicitFileType: q("archive.appex"),
    includeInIndex: 0,
    path: q(`${WIDGET_TARGET_NAME}.appex`),
    sourceTree: "BUILT_PRODUCTS_DIR",
  };
  objects["PBXFileReference"][`${productRefUuid}_comment`] =
    `${WIDGET_TARGET_NAME}.appex`;

  objects["PBXBuildFile"][embedBuildFileUuid] = {
    isa: "PBXBuildFile",
    fileRef: productRefUuid,
    settings: { ATTRIBUTES: ["RemoveHeadersOnCopy"] },
  };
  objects["PBXBuildFile"][`${embedBuildFileUuid}_comment`] =
    `${WIDGET_TARGET_NAME}.appex in Embed Foundation Extensions`;

  objects["PBXCopyFilesBuildPhase"][embedPhaseUuid] = {
    isa: "PBXCopyFilesBuildPhase",
    buildActionMask: 2147483647,
    dstPath: q(""),
    dstSubfolderSpec: 13,
    files: [
      {
        value: embedBuildFileUuid,
        comment: `${WIDGET_TARGET_NAME}.appex in Embed Foundation Extensions`,
      },
    ],
    name: q("Embed Foundation Extensions"),
    runOnlyForDeploymentPostprocessing: 0,
  };
  objects["PBXCopyFilesBuildPhase"][`${embedPhaseUuid}_comment`] =
    "Embed Foundation Extensions";

  
  const mainTargetUuid = project.getFirstTarget().uuid;
  const mainTarget = objects["PBXNativeTarget"][mainTargetUuid];
  mainTarget.buildPhases.push({
    value: embedPhaseUuid,
    comment: "Embed Foundation Extensions",
  });

  
  const groupUuid = generateUuid();
  objects["PBXGroup"][groupUuid] = {
    isa: "PBXGroup",
    children: sourceFiles.map(({ fileRefUuid, file }) => ({
      value: fileRefUuid,
      comment: file,
    })),
    name: q(WIDGET_TARGET_NAME),
    path: q(WIDGET_TARGET_NAME),
    sourceTree: q("<group>"),
  };
  objects["PBXGroup"][`${groupUuid}_comment`] = WIDGET_TARGET_NAME;

  const mainGroup = objects["PBXGroup"][pbxProject.mainGroup];
  mainGroup.children.push({ value: groupUuid, comment: WIDGET_TARGET_NAME });
}

function copyWidgetFiles(iosDir, appGroupId) {
  const destDir = path.join(iosDir, WIDGET_TARGET_NAME);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  const files = fs
    .readdirSync(WIDGET_SOURCE_DIR)
    .filter((f) => f.endsWith(".swift"));
  for (const file of files) {
    fs.copyFileSync(
      path.join(WIDGET_SOURCE_DIR, file),
      path.join(destDir, file)
    );
  }

  const widgetConfigSrc = path.join(__dirname, "../ios/WidgetConfig.swift");
  if (fs.existsSync(widgetConfigSrc)) {
    fs.copyFileSync(widgetConfigSrc, path.join(destDir, "WidgetConfig.swift"));
  }

  const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDisplayName</key>
  <string>${WIDGET_TARGET_NAME}</string>
  <key>CFBundleExecutable</key>
  <string>$(EXECUTABLE_NAME)</string>
  <key>CFBundleIdentifier</key>
  <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>$(PRODUCT_NAME)</string>
  <key>CFBundlePackageType</key>
  <string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
  <key>CFBundleShortVersionString</key>
  <string>$(MARKETING_VERSION)</string>
  <key>CFBundleVersion</key>
  <string>$(CURRENT_PROJECT_VERSION)</string>
  <key>NSExtension</key>
  <dict>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.widgetkit-extension</string>
  </dict>
  <key>WIDGET_APP_GROUP_ID</key>
  <string>${appGroupId}</string>
</dict>
</plist>`;
  fs.writeFileSync(path.join(destDir, "Info.plist"), infoPlist);

  const entitlements = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.application-groups</key>
  <array>
    <string>${appGroupId}</string>
  </array>
</dict>
</plist>`;
  fs.writeFileSync(
    path.join(destDir, `${WIDGET_TARGET_NAME}.entitlements`),
    entitlements
  );
}

module.exports = (config, { appGroupId }) => {
  if (!appGroupId)
    throw new Error("withWidgetExtension: appGroupId is required");

  const bundleId = config.ios?.bundleIdentifier;
  if (!bundleId)
    throw new Error(
      "withWidgetExtension: ios.bundleIdentifier is required in app.config.js"
    );

  
  config = withInfoPlist(config, (c) => {
    c.modResults["WIDGET_APP_GROUP_ID"] = appGroupId;
    return c;
  });

  
  config = withEntitlementsPlist(config, (c) => {
    const key = "com.apple.security.application-groups";
    const existing = c.modResults[key] ?? [];
    if (!existing.includes(appGroupId)) {
      c.modResults[key] = [...existing, appGroupId];
    }
    return c;
  });

  
  config = withXcodeProject(config, (c) => {
    const project = c.modResults;
    const objects = project.hash.project.objects;

    
    const targets = objects["PBXNativeTarget"] || {};
    const alreadyAdded = Object.values(targets).some(
      (t) => t?.name === WIDGET_TARGET_NAME
    );
    if (alreadyAdded) {
      console.log(
        `withWidgetExtension: ${WIDGET_TARGET_NAME} target already exists, skipping.`
      );
      return c;
    }

    const iosDir = path.join(config._internal.projectRoot, "ios");
    copyWidgetFiles(iosDir, appGroupId);
    addWidgetExtensionTarget(project, appGroupId, bundleId);

    return c;
  });

  return config;
};