// Finest 3.5-Turbo code



import {
  extension_settings,
  loadExtensionSettings,
} from "../../../extensions.js";

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

  // Updating settings in the UI
  $("#auto_load_font")
    .prop("checked", extension_settings[extensionName].autoLoad)
    .trigger("input");

  // Load fonts from settings
  const settingFonts = extension_settings[extensionName].fonts;
  fontInfo.googleFonts = fontInfo.googleFonts.concat(settingFonts.googleFonts);
  fontInfo.localFonts = fontInfo.localFonts.concat(settingFonts.localFonts);
  activeFont = extension_settings[extensionName].activeFont;
  autoLoad = extension_settings[extensionName].autoLoad;
}



function onAutoLoadInput(event) {
  const value = Boolean($(event.target).prop("checked"));
  extension_settings[extensionName].autoLoad = value;
  saveSettingsDebounced();
}
// Initialize a bigger object to store font information
const fontInfo = {
  googleFonts: [],
  localFonts: [],
};

let activeFont; // Initialize the activeFont variable

let autoLoad;

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
    toastr.error(`Font "${googleFontName}" already exists in Google Fonts.`);
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
    toastr.success("Font added: " + JSON.stringify(googleFontName));
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
    toastr.error(`Font "${localFontName}" already exists in Local Fonts.`);
  } else {
    // Create an object with name-value pairs and add it to the localFonts array
    const localFontObject = {
      name: localFontName,
    };
    fontInfo.localFonts.push(localFontObject);

    // Clear the textarea field
    document.getElementById("local_font_name").value = "";

    // Print the updated fontInfo object for testing
    toastr.success("Font added: " + JSON.stringify(localFontName));
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
  toastr.success("Font removed: " + JSON.stringify(fontName));
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
    document.body.style.fontFamily = fontName + ", 'Noto Color Emoji', sans-serif";

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
    toastr.error("Please select a font");
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
  toastr.success("Font loaded: " + JSON.stringify(selectedFontName));
}

function setBodyFont(fontName) {
  document.body.style.fontFamily = fontName + ", 'Noto Color Emoji', sans-serif";
}

// This function is called when the extension is loaded
jQuery(async () => {
  // This is an example of loading HTML from a file
  const settingsHtml = await $.get(`${extensionFolderPath}/index.html`);

  // Append settingsHtml to extensions_settings
  // extension_settings and extensions_settings2 are the left and right columns of the settings menu
  // Left should be extensions that deal with system functions and right should be visual/UI related
  $("#extensions_settings").append(settingsHtml);

  // These are examples of listening for events
  $("#google_font_submit_button").on("click", addGoogleFont);
  $("#local_font_submit_button").on("click", addLocalFont);
  $("#manual_load_font").on("click", loadSelectedFont);
  $("#selected_font_remove_submit_button").on("click", function () {
    removeFontByName(); 

    populateFontNames(); 
  });
  $("#auto_load_font").on("input", onAutoLoadInput);

  // Load settings when starting things up (if you have any)
  loadSettings();
  populateFontNames();
  if (autoLoad) {
    if (
      activeFont &&
      (fontInfo.googleFonts.some((font) => font.name === activeFont.name) ||
        fontInfo.localFonts.some((font) => font.name === activeFont.name))
    ) {
      loadSelectedFont();
    } else {
      toastr.error(
        "The selected font does not exist. Please choose another one."
      );
    }
  }
});
