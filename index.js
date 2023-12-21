// Finest 3.5-Turbo code

import {
  extension_settings,
  loadExtensionSettings,
} from "../../../extensions.js";

import { power_user } from "../../../power-user.js";

//You'll likely need to import some other functions from the main script
import { saveSettingsDebounced } from "../../../../script.js";

// Keep track of where your extension is located, name should match repo name
const extensionName = "st-custom-fonts";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
const extensionSettings = extension_settings[extensionName];
const defaultSettings = {};

// Loads the extension settings if they exist, otherwise initializes them to the defaults.
async function loadSettings() {
  //Create the settings if they don't exist
  extension_settings[extensionName] = extension_settings[extensionName] || {};
  if (Object.keys(extension_settings[extensionName]).length === 0) {
    Object.assign(extension_settings[extensionName], defaultSettings);
  }

  // Load fonts from settings
  const settingFonts = extension_settings[extensionName].fonts;
  fontInfo.googleFonts = fontInfo.googleFonts.concat(settingFonts.googleFonts);
  fontInfo.localFonts = fontInfo.localFonts.concat(settingFonts.localFonts);
  activeFont = extension_settings[extensionName].activeFont;
  autoLoad = extension_settings[extensionName].autoLoad;
  autoLoadThemeFont = extension_settings[extensionName].autoLoadThemePreset;
  theme = power_user.theme;
  notificationsEnabled = extension_settings[extensionName].notificationsEnabled;

  $("#notifications_enabled")
    .prop("checked", notificationsEnabled)
    .trigger("input");

  populateFontNames();

  // Updating settings in the UI

  $("#auto_load_font_theme")
    .prop("checked", autoLoadThemeFont)
    .trigger("input");

  $("#auto_load_font").prop("checked", autoLoad).trigger("input");
}

// Initialize a bigger object to store font information
let fontInfo = {
  googleFonts: [],
  localFonts: [],
};

let activeFont; // Initialize the activeFont variable

let autoLoad;

let autoLoadThemeFont;

let theme;

var notificationsEnabled = true;

function addThemeAssociation() {
  // Check if activeFont is in googleFonts
  const activeFontIndexInGoogle = fontInfo.googleFonts.findIndex(
    (font) => font.name === activeFont.name
  );

  // Check if activeFont is in localFonts
  const activeFontIndexInLocal = fontInfo.localFonts.findIndex(
    (font) => font.name === activeFont.name
  );

  if (activeFontIndexInGoogle !== -1) {
    // Add the theme to the activeFont in googleFonts
    fontInfo.googleFonts[activeFontIndexInGoogle].associatedTheme = theme;
  } else if (activeFontIndexInLocal !== -1) {
    // Add the theme to the activeFont in localFonts
    fontInfo.localFonts[activeFontIndexInLocal].associatedTheme = theme;
  }

  // Your other logic here
  extension_settings[extensionName].fonts = fontInfo;
  saveSettingsDebounced();
  if (notificationsEnabled) {
    toastr.success(
      JSON.stringify(activeFont.name) +
        " was successfully associated with " +
        JSON.stringify(theme)
    );
  }
}

function onNotificationInput(event) {
  const value = Boolean($(event.target).prop("checked"));
  extension_settings[extensionName].notificationsEnabled = value;
  saveSettingsDebounced();
  notificationsEnabled = extension_settings[extensionName].notificationsEnabled;
  if (notificationsEnabled) {
    toastr.success("Notifiations turned: " + (value ? "on" : "off"));
  }
}

function onAutoLoadInputTheme(event) {
  const value = Boolean($(event.target).prop("checked"));
  extension_settings[extensionName].autoLoadThemePreset = value;
  saveSettingsDebounced();
  if (notificationsEnabled) {
    toastr.success("Theme association: " + (value ? "on" : "off"));
  }
}

function onAutoLoadInput(event) {
  const value = Boolean($(event.target).prop("checked"));
  extension_settings[extensionName].autoLoad = value;
  saveSettingsDebounced();
}

// Function to populate the <select> element with font names
function populateFontNames() {
  // Get a reference to the <select> element
  const selectElement = document.getElementById("selected_font");
  const selectElementRemove = document.getElementById("selected_font_remove");

  // Clear existing options in both dropdowns
  selectElement.innerHTML = "";
  selectElementRemove.innerHTML = "";

  // Add an initial option with the activeFont as the default
  const defaultOption = document.createElement("option");
  if (
    activeFont &&
    (fontInfo.googleFonts.some((font) => font.name === activeFont.name) ||
      fontInfo.localFonts.some((font) => font.name === activeFont.name))
  ) {
    defaultOption.text = activeFont.name;
  } else {
    defaultOption.text = "Select a Font";
  }
  selectElement.appendChild(defaultOption);
  selectElementRemove.appendChild(defaultOption.cloneNode(true));

  // Add font names from the googleFonts array to both dropdowns
  for (const googleFont of fontInfo.googleFonts) {
    const option = document.createElement("option");
    option.text = googleFont.name;
    selectElement.appendChild(option);
    selectElementRemove.appendChild(option.cloneNode(true));
  }

  // Add font names from the localFonts array to both dropdowns
  for (const localFont of fontInfo.localFonts) {
    const option = document.createElement("option");
    option.text = localFont.name;
    selectElement.appendChild(option);
    selectElementRemove.appendChild(option.cloneNode(true));
  }

  // Update the extension_settings object with the modified fonts data
  extension_settings[extensionName].fonts = fontInfo;
  saveSettingsDebounced();
}

function addGoogleFont() {
  const googleFontName = document.getElementById("google_font_name").value;
  const googleFontLink = document.getElementById("google_font_link").value;

  // Check if a font with the same name already exists in googleFonts
  const existingFont = fontInfo.googleFonts.find(
    (font) => font.name === googleFontName
  );

  if (existingFont) {
    if (notificationsEnabled) {
      toastr.error(`Font "${googleFontName}" already exists in Google Fonts.`);
    }
  } else {
    // Create an object with name-value pairs and add it to the googleFonts array
    const googleFontObject = {
      name: googleFontName,
      link: googleFontLink,
    };
    fontInfo.googleFonts.push(googleFontObject);

    // Clear the textarea fields
    document.getElementById("google_font_name").value = "";
    document.getElementById("google_font_link").value = "";

    // Print the updated fontInfo object for testing
    if (notificationsEnabled) {
      toastr.success("Font added: " + JSON.stringify(googleFontName));
    }
    populateFontNames();
  }
}

function addLocalFont() {
  const localFontName = document.getElementById("local_font_name").value;

  // Check if a font with the same name already exists in localFonts
  const existingFont = fontInfo.localFonts.find(
    (font) => font.name === localFontName
  );

  if (existingFont) {
    if (notificationsEnabled) {
      toastr.error(`Font "${localFontName}" already exists in Local Fonts.`);
    }
  } else {
    // Create an object with name-value pairs and add it to the localFonts array
    const localFontObject = {
      name: localFontName,
    };
    fontInfo.localFonts.push(localFontObject);

    // Clear the textarea field
    document.getElementById("local_font_name").value = "";

    // Print the updated fontInfo object for testing
    if (notificationsEnabled) {
      toastr.success("Font added: " + JSON.stringify(localFontName));
    }
  }
  populateFontNames();
}

function removeFontByName() {
  const fontName = document.getElementById("selected_font_remove").value;
  // Remove the font from the googleFonts array, if it exists
  fontInfo.googleFonts = fontInfo.googleFonts.filter(function (font) {
    return font.name !== fontName;
  });

  // Remove the font from the localFonts array, if it exists
  fontInfo.localFonts = fontInfo.localFonts.filter(function (font) {
    return font.name !== fontName;
  });
  if (notificationsEnabled) {
    toastr.success("Font removed: " + JSON.stringify(fontName));
  }
}

function loadGoogleFont(fontLink) {
  // Create a new link element
  var linkElement = document.createElement("link");
  linkElement.rel = "stylesheet";
  linkElement.href = fontLink;

  // Append the link element to the document's head
  document.head.appendChild(linkElement);

  // Wait for the font to load and then apply it as the first font
  linkElement.addEventListener("load", function () {
    // Extract the font name from the fontLink
    var fontName = extractFontName(fontLink);

    // Set the font as the first font in the font family
    document.body.style.fontFamily =
      fontName + ", 'Noto Color Emoji', sans-serif";
  });

  // Function to extract the font name from a Google Font URL
  function extractFontName(fontLink) {
    var fontNameMatch = fontLink.match(/family=([^&]+)/);
    if (fontNameMatch && fontNameMatch[1]) {
      var fontName = fontNameMatch[1].split(":wght@")[0];
      return decodeURIComponent(fontName.replace(/\+/g, " "));
    }
    return "";
  }
}

function loadSelectedFont() {
  const selectElement = document.getElementById("selected_font");
  const selectedOption = selectElement.options[selectElement.selectedIndex];

  if (!"Select a Font") {
    if (notificationsEnabled) {
      toastr.error("Please select a font");
    }
    return;
  }

  const selectedFontName = selectedOption.text;
  const isGoogleFont = fontInfo.googleFonts.some(
    (font) => font.name === selectedFontName
  );

  if (isGoogleFont) {
    // Find the Google Font link based on the selected font name
    const selectedFont = fontInfo.googleFonts.find(
      (font) => font.name === selectedFontName
    );

    // Set the activeFont to the selected Google Font
    activeFont = selectedFont;

    // Call the loadGoogleFont function with the font link
    loadGoogleFont(activeFont.link);
  } else {
    // Set the activeFont to the selected local font name
    activeFont = { name: selectedFontName };

    // Call the function to set the body font to the selected local font name
    setBodyFont(selectedFontName);
  }
  extension_settings[extensionName].activeFont = activeFont;
  saveSettingsDebounced();
  if (notificationsEnabled) {
    toastr.success("Font loaded: " + JSON.stringify(selectedFontName));
  }
}

function setSelectedFontByAssociatedTheme() {
  // Check googleFonts for a font with the associated theme
  const matchedGoogleFont = fontInfo.googleFonts.find(
    (font) => font.associatedTheme === theme
  );

  // Check localFonts for a font with the associated theme
  const matchedLocalFont = fontInfo.localFonts.find(
    (font) => font.associatedTheme === theme
  );

  if (matchedGoogleFont) {
    // Set selected_font element to the matched Google Font
    document.getElementById("selected_font").value = matchedGoogleFont.name;

    // Call loadSelectedFont
    loadSelectedFont();
  } else if (matchedLocalFont) {
    // Set selected_font element to the matched Local Font
    document.getElementById("selected_font").value = matchedLocalFont.name;

    // Call loadSelectedFont
    loadSelectedFont();

    // Show success notification
    if (notificationsEnabled) {
      toastr.success(`Selected font set to ${matchedLocalFont.name}`);
    }
  } else {
    // Show a notification if no font with the associated theme was found
    if (notificationsEnabled) {
      toastr.error(`No font with the associated theme '${theme}' found.`);
    }
  }
}

function setBodyFont(fontName) {
  document.body.style.fontFamily =
    fontName + ", 'Noto Color Emoji', sans-serif";
    
}

// This function is called when the extension is loaded
jQuery(async () => {
  //add a delay to possibly fix some conflicts
  await new Promise(resolve => setTimeout(resolve, 3000));
  // This is an example of loading HTML from a file
  const settingsHtml = await $.get(`${extensionFolderPath}/index.html`);

  // Append settingsHtml to extensions_settings
  // extension_settings and extensions_settings2 are the left and right columns of the settings menu
  // Left should be extensions that deal with system functions and right should be visual/UI related
  $("#extensions_settings").append(settingsHtml);

  // These are examples of listening for events
  $("#google_font_submit_button").on("click", addGoogleFont);
  $("#apply_theme_association").on("click", addThemeAssociation);
  $("#auto_load_font_theme").on("input", onAutoLoadInputTheme);
  $("#notifications_enabled").on("input", onNotificationInput);
  $("#local_font_submit_button").on("click", addLocalFont);
  $("#manual_load_font").on("click", loadSelectedFont);
  $("#selected_font_remove_submit_button").on("click", function () {
    removeFontByName();

    populateFontNames();
  });
  $("#themes").on("change", function () {
    if (autoLoadThemeFont) {
      theme = power_user.theme;
      setSelectedFontByAssociatedTheme();
    }
  });

  $("#auto_load_font").on("input", onAutoLoadInput);

  // Load settings when starting things up (if you have any)
  loadSettings();
  if (autoLoad) {
    if (
      activeFont &&
      (fontInfo.googleFonts.some((font) => font.name === activeFont.name) ||
        fontInfo.localFonts.some((font) => font.name === activeFont.name))
    ) {
      loadSelectedFont();
    } else {
      if (notificationsEnabled) {
        toastr.error(
          "The selected font does not exist. Please choose another one."
        );
      }
    }
  }

  if (autoLoadThemeFont) {
    setSelectedFontByAssociatedTheme();
  }
});
