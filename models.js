/* Add or remove entries freely; all assets use the same 320 × 520 neutral pose. */
(function(root) {
  const models = [
  {
    "id": "slim-light-long",
    "heightClass": "short",
    "build": "slim",
    "skinTone": "light",
    "hairStyle": "long",
    "hairColor": "black",
    "heightCm": 156,
    "image": "assets/models/slim-light-long.svg"
  },
  {
    "id": "slim-light-bob",
    "heightClass": "average",
    "build": "slim",
    "skinTone": "light",
    "hairStyle": "bob",
    "hairColor": "brown",
    "heightCm": 168,
    "image": "assets/models/slim-light-bob.svg"
  },
  {
    "id": "slim-light-short",
    "heightClass": "tall",
    "build": "slim",
    "skinTone": "light",
    "hairStyle": "short",
    "hairColor": "blonde",
    "heightCm": 181,
    "image": "assets/models/slim-light-short.svg"
  },
  {
    "id": "slim-light-none",
    "heightClass": "short",
    "build": "slim",
    "skinTone": "light",
    "hairStyle": "none",
    "hairColor": "gray",
    "heightCm": 156,
    "image": "assets/models/slim-light-none.svg"
  },
  {
    "id": "slim-light-medium-long",
    "heightClass": "average",
    "build": "slim",
    "skinTone": "light-medium",
    "hairStyle": "long",
    "hairColor": "brown",
    "heightCm": 168,
    "image": "assets/models/slim-light-medium-long.svg"
  },
  {
    "id": "slim-light-medium-bob",
    "heightClass": "tall",
    "build": "slim",
    "skinTone": "light-medium",
    "hairStyle": "bob",
    "hairColor": "blonde",
    "heightCm": 181,
    "image": "assets/models/slim-light-medium-bob.svg"
  },
  {
    "id": "slim-light-medium-short",
    "heightClass": "short",
    "build": "slim",
    "skinTone": "light-medium",
    "hairStyle": "short",
    "hairColor": "gray",
    "heightCm": 156,
    "image": "assets/models/slim-light-medium-short.svg"
  },
  {
    "id": "slim-light-medium-none",
    "heightClass": "average",
    "build": "slim",
    "skinTone": "light-medium",
    "hairStyle": "none",
    "hairColor": "black",
    "heightCm": 168,
    "image": "assets/models/slim-light-medium-none.svg"
  },
  {
    "id": "slim-medium-long",
    "heightClass": "tall",
    "build": "slim",
    "skinTone": "medium",
    "hairStyle": "long",
    "hairColor": "blonde",
    "heightCm": 181,
    "image": "assets/models/slim-medium-long.svg"
  },
  {
    "id": "slim-medium-bob",
    "heightClass": "short",
    "build": "slim",
    "skinTone": "medium",
    "hairStyle": "bob",
    "hairColor": "gray",
    "heightCm": 156,
    "image": "assets/models/slim-medium-bob.svg"
  },
  {
    "id": "slim-medium-short",
    "heightClass": "average",
    "build": "slim",
    "skinTone": "medium",
    "hairStyle": "short",
    "hairColor": "black",
    "heightCm": 168,
    "image": "assets/models/slim-medium-short.svg"
  },
  {
    "id": "slim-medium-none",
    "heightClass": "tall",
    "build": "slim",
    "skinTone": "medium",
    "hairStyle": "none",
    "hairColor": "brown",
    "heightCm": 181,
    "image": "assets/models/slim-medium-none.svg"
  },
  {
    "id": "slim-medium-deep-long",
    "heightClass": "short",
    "build": "slim",
    "skinTone": "medium-deep",
    "hairStyle": "long",
    "hairColor": "gray",
    "heightCm": 156,
    "image": "assets/models/slim-medium-deep-long.svg"
  },
  {
    "id": "slim-medium-deep-bob",
    "heightClass": "average",
    "build": "slim",
    "skinTone": "medium-deep",
    "hairStyle": "bob",
    "hairColor": "black",
    "heightCm": 168,
    "image": "assets/models/slim-medium-deep-bob.svg"
  },
  {
    "id": "slim-medium-deep-short",
    "heightClass": "tall",
    "build": "slim",
    "skinTone": "medium-deep",
    "hairStyle": "short",
    "hairColor": "brown",
    "heightCm": 181,
    "image": "assets/models/slim-medium-deep-short.svg"
  },
  {
    "id": "slim-medium-deep-none",
    "heightClass": "short",
    "build": "slim",
    "skinTone": "medium-deep",
    "hairStyle": "none",
    "hairColor": "blonde",
    "heightCm": 156,
    "image": "assets/models/slim-medium-deep-none.svg"
  },
  {
    "id": "slim-deep-long",
    "heightClass": "average",
    "build": "slim",
    "skinTone": "deep",
    "hairStyle": "long",
    "hairColor": "black",
    "heightCm": 168,
    "image": "assets/models/slim-deep-long.svg"
  },
  {
    "id": "slim-deep-bob",
    "heightClass": "tall",
    "build": "slim",
    "skinTone": "deep",
    "hairStyle": "bob",
    "hairColor": "brown",
    "heightCm": 181,
    "image": "assets/models/slim-deep-bob.svg"
  },
  {
    "id": "slim-deep-short",
    "heightClass": "short",
    "build": "slim",
    "skinTone": "deep",
    "hairStyle": "short",
    "hairColor": "blonde",
    "heightCm": 156,
    "image": "assets/models/slim-deep-short.svg"
  },
  {
    "id": "slim-deep-none",
    "heightClass": "average",
    "build": "slim",
    "skinTone": "deep",
    "hairStyle": "none",
    "hairColor": "gray",
    "heightCm": 168,
    "image": "assets/models/slim-deep-none.svg"
  },
  {
    "id": "slim-rich-deep-long",
    "heightClass": "tall",
    "build": "slim",
    "skinTone": "rich-deep",
    "hairStyle": "long",
    "hairColor": "brown",
    "heightCm": 181,
    "image": "assets/models/slim-rich-deep-long.svg"
  },
  {
    "id": "slim-rich-deep-bob",
    "heightClass": "short",
    "build": "slim",
    "skinTone": "rich-deep",
    "hairStyle": "bob",
    "hairColor": "blonde",
    "heightCm": 156,
    "image": "assets/models/slim-rich-deep-bob.svg"
  },
  {
    "id": "slim-rich-deep-short",
    "heightClass": "average",
    "build": "slim",
    "skinTone": "rich-deep",
    "hairStyle": "short",
    "hairColor": "gray",
    "heightCm": 168,
    "image": "assets/models/slim-rich-deep-short.svg"
  },
  {
    "id": "slim-rich-deep-none",
    "heightClass": "tall",
    "build": "slim",
    "skinTone": "rich-deep",
    "hairStyle": "none",
    "hairColor": "black",
    "heightCm": 181,
    "image": "assets/models/slim-rich-deep-none.svg"
  },
  {
    "id": "regular-light-long",
    "heightClass": "average",
    "build": "regular",
    "skinTone": "light",
    "hairStyle": "long",
    "hairColor": "black",
    "heightCm": 168,
    "image": "assets/models/regular-light-long.svg"
  },
  {
    "id": "regular-light-bob",
    "heightClass": "tall",
    "build": "regular",
    "skinTone": "light",
    "hairStyle": "bob",
    "hairColor": "brown",
    "heightCm": 181,
    "image": "assets/models/regular-light-bob.svg"
  },
  {
    "id": "regular-light-short",
    "heightClass": "short",
    "build": "regular",
    "skinTone": "light",
    "hairStyle": "short",
    "hairColor": "blonde",
    "heightCm": 156,
    "image": "assets/models/regular-light-short.svg"
  },
  {
    "id": "regular-light-none",
    "heightClass": "average",
    "build": "regular",
    "skinTone": "light",
    "hairStyle": "none",
    "hairColor": "gray",
    "heightCm": 168,
    "image": "assets/models/regular-light-none.svg"
  },
  {
    "id": "regular-light-medium-long",
    "heightClass": "tall",
    "build": "regular",
    "skinTone": "light-medium",
    "hairStyle": "long",
    "hairColor": "brown",
    "heightCm": 181,
    "image": "assets/models/regular-light-medium-long.svg"
  },
  {
    "id": "regular-light-medium-bob",
    "heightClass": "short",
    "build": "regular",
    "skinTone": "light-medium",
    "hairStyle": "bob",
    "hairColor": "blonde",
    "heightCm": 156,
    "image": "assets/models/regular-light-medium-bob.svg"
  },
  {
    "id": "regular-light-medium-short",
    "heightClass": "average",
    "build": "regular",
    "skinTone": "light-medium",
    "hairStyle": "short",
    "hairColor": "gray",
    "heightCm": 168,
    "image": "assets/models/regular-light-medium-short.svg"
  },
  {
    "id": "regular-light-medium-none",
    "heightClass": "tall",
    "build": "regular",
    "skinTone": "light-medium",
    "hairStyle": "none",
    "hairColor": "black",
    "heightCm": 181,
    "image": "assets/models/regular-light-medium-none.svg"
  },
  {
    "id": "regular-medium-long",
    "heightClass": "short",
    "build": "regular",
    "skinTone": "medium",
    "hairStyle": "long",
    "hairColor": "blonde",
    "heightCm": 156,
    "image": "assets/models/regular-medium-long.svg"
  },
  {
    "id": "regular-medium-bob",
    "heightClass": "average",
    "build": "regular",
    "skinTone": "medium",
    "hairStyle": "bob",
    "hairColor": "gray",
    "heightCm": 168,
    "image": "assets/models/regular-medium-bob.svg"
  },
  {
    "id": "regular-medium-short",
    "heightClass": "tall",
    "build": "regular",
    "skinTone": "medium",
    "hairStyle": "short",
    "hairColor": "black",
    "heightCm": 181,
    "image": "assets/models/regular-medium-short.svg"
  },
  {
    "id": "regular-medium-none",
    "heightClass": "short",
    "build": "regular",
    "skinTone": "medium",
    "hairStyle": "none",
    "hairColor": "brown",
    "heightCm": 156,
    "image": "assets/models/regular-medium-none.svg"
  },
  {
    "id": "regular-medium-deep-long",
    "heightClass": "average",
    "build": "regular",
    "skinTone": "medium-deep",
    "hairStyle": "long",
    "hairColor": "gray",
    "heightCm": 168,
    "image": "assets/models/regular-medium-deep-long.svg"
  },
  {
    "id": "regular-medium-deep-bob",
    "heightClass": "tall",
    "build": "regular",
    "skinTone": "medium-deep",
    "hairStyle": "bob",
    "hairColor": "black",
    "heightCm": 181,
    "image": "assets/models/regular-medium-deep-bob.svg"
  },
  {
    "id": "regular-medium-deep-short",
    "heightClass": "short",
    "build": "regular",
    "skinTone": "medium-deep",
    "hairStyle": "short",
    "hairColor": "brown",
    "heightCm": 156,
    "image": "assets/models/regular-medium-deep-short.svg"
  },
  {
    "id": "regular-medium-deep-none",
    "heightClass": "average",
    "build": "regular",
    "skinTone": "medium-deep",
    "hairStyle": "none",
    "hairColor": "blonde",
    "heightCm": 168,
    "image": "assets/models/regular-medium-deep-none.svg"
  },
  {
    "id": "regular-deep-long",
    "heightClass": "tall",
    "build": "regular",
    "skinTone": "deep",
    "hairStyle": "long",
    "hairColor": "black",
    "heightCm": 181,
    "image": "assets/models/regular-deep-long.svg"
  },
  {
    "id": "regular-deep-bob",
    "heightClass": "short",
    "build": "regular",
    "skinTone": "deep",
    "hairStyle": "bob",
    "hairColor": "brown",
    "heightCm": 156,
    "image": "assets/models/regular-deep-bob.svg"
  },
  {
    "id": "regular-deep-short",
    "heightClass": "average",
    "build": "regular",
    "skinTone": "deep",
    "hairStyle": "short",
    "hairColor": "blonde",
    "heightCm": 168,
    "image": "assets/models/regular-deep-short.svg"
  },
  {
    "id": "regular-deep-none",
    "heightClass": "tall",
    "build": "regular",
    "skinTone": "deep",
    "hairStyle": "none",
    "hairColor": "gray",
    "heightCm": 181,
    "image": "assets/models/regular-deep-none.svg"
  },
  {
    "id": "regular-rich-deep-long",
    "heightClass": "short",
    "build": "regular",
    "skinTone": "rich-deep",
    "hairStyle": "long",
    "hairColor": "brown",
    "heightCm": 156,
    "image": "assets/models/regular-rich-deep-long.svg"
  },
  {
    "id": "regular-rich-deep-bob",
    "heightClass": "average",
    "build": "regular",
    "skinTone": "rich-deep",
    "hairStyle": "bob",
    "hairColor": "blonde",
    "heightCm": 168,
    "image": "assets/models/regular-rich-deep-bob.svg"
  },
  {
    "id": "regular-rich-deep-short",
    "heightClass": "tall",
    "build": "regular",
    "skinTone": "rich-deep",
    "hairStyle": "short",
    "hairColor": "gray",
    "heightCm": 181,
    "image": "assets/models/regular-rich-deep-short.svg"
  },
  {
    "id": "regular-rich-deep-none",
    "heightClass": "short",
    "build": "regular",
    "skinTone": "rich-deep",
    "hairStyle": "none",
    "hairColor": "black",
    "heightCm": 156,
    "image": "assets/models/regular-rich-deep-none.svg"
  },
  {
    "id": "full-light-long",
    "heightClass": "tall",
    "build": "full",
    "skinTone": "light",
    "hairStyle": "long",
    "hairColor": "black",
    "heightCm": 181,
    "image": "assets/models/full-light-long.svg"
  },
  {
    "id": "full-light-bob",
    "heightClass": "short",
    "build": "full",
    "skinTone": "light",
    "hairStyle": "bob",
    "hairColor": "brown",
    "heightCm": 156,
    "image": "assets/models/full-light-bob.svg"
  },
  {
    "id": "full-light-short",
    "heightClass": "average",
    "build": "full",
    "skinTone": "light",
    "hairStyle": "short",
    "hairColor": "blonde",
    "heightCm": 168,
    "image": "assets/models/full-light-short.svg"
  },
  {
    "id": "full-light-none",
    "heightClass": "tall",
    "build": "full",
    "skinTone": "light",
    "hairStyle": "none",
    "hairColor": "gray",
    "heightCm": 181,
    "image": "assets/models/full-light-none.svg"
  },
  {
    "id": "full-light-medium-long",
    "heightClass": "short",
    "build": "full",
    "skinTone": "light-medium",
    "hairStyle": "long",
    "hairColor": "brown",
    "heightCm": 156,
    "image": "assets/models/full-light-medium-long.svg"
  },
  {
    "id": "full-light-medium-bob",
    "heightClass": "average",
    "build": "full",
    "skinTone": "light-medium",
    "hairStyle": "bob",
    "hairColor": "blonde",
    "heightCm": 168,
    "image": "assets/models/full-light-medium-bob.svg"
  },
  {
    "id": "full-light-medium-short",
    "heightClass": "tall",
    "build": "full",
    "skinTone": "light-medium",
    "hairStyle": "short",
    "hairColor": "gray",
    "heightCm": 181,
    "image": "assets/models/full-light-medium-short.svg"
  },
  {
    "id": "full-light-medium-none",
    "heightClass": "short",
    "build": "full",
    "skinTone": "light-medium",
    "hairStyle": "none",
    "hairColor": "black",
    "heightCm": 156,
    "image": "assets/models/full-light-medium-none.svg"
  },
  {
    "id": "full-medium-long",
    "heightClass": "average",
    "build": "full",
    "skinTone": "medium",
    "hairStyle": "long",
    "hairColor": "blonde",
    "heightCm": 168,
    "image": "assets/models/full-medium-long.svg"
  },
  {
    "id": "full-medium-bob",
    "heightClass": "tall",
    "build": "full",
    "skinTone": "medium",
    "hairStyle": "bob",
    "hairColor": "gray",
    "heightCm": 181,
    "image": "assets/models/full-medium-bob.svg"
  },
  {
    "id": "full-medium-short",
    "heightClass": "short",
    "build": "full",
    "skinTone": "medium",
    "hairStyle": "short",
    "hairColor": "black",
    "heightCm": 156,
    "image": "assets/models/full-medium-short.svg"
  },
  {
    "id": "full-medium-none",
    "heightClass": "average",
    "build": "full",
    "skinTone": "medium",
    "hairStyle": "none",
    "hairColor": "brown",
    "heightCm": 168,
    "image": "assets/models/full-medium-none.svg"
  },
  {
    "id": "full-medium-deep-long",
    "heightClass": "tall",
    "build": "full",
    "skinTone": "medium-deep",
    "hairStyle": "long",
    "hairColor": "gray",
    "heightCm": 181,
    "image": "assets/models/full-medium-deep-long.svg"
  },
  {
    "id": "full-medium-deep-bob",
    "heightClass": "short",
    "build": "full",
    "skinTone": "medium-deep",
    "hairStyle": "bob",
    "hairColor": "black",
    "heightCm": 156,
    "image": "assets/models/full-medium-deep-bob.svg"
  },
  {
    "id": "full-medium-deep-short",
    "heightClass": "average",
    "build": "full",
    "skinTone": "medium-deep",
    "hairStyle": "short",
    "hairColor": "brown",
    "heightCm": 168,
    "image": "assets/models/full-medium-deep-short.svg"
  },
  {
    "id": "full-medium-deep-none",
    "heightClass": "tall",
    "build": "full",
    "skinTone": "medium-deep",
    "hairStyle": "none",
    "hairColor": "blonde",
    "heightCm": 181,
    "image": "assets/models/full-medium-deep-none.svg"
  },
  {
    "id": "full-deep-long",
    "heightClass": "short",
    "build": "full",
    "skinTone": "deep",
    "hairStyle": "long",
    "hairColor": "black",
    "heightCm": 156,
    "image": "assets/models/full-deep-long.svg"
  },
  {
    "id": "full-deep-bob",
    "heightClass": "average",
    "build": "full",
    "skinTone": "deep",
    "hairStyle": "bob",
    "hairColor": "brown",
    "heightCm": 168,
    "image": "assets/models/full-deep-bob.svg"
  },
  {
    "id": "full-deep-short",
    "heightClass": "tall",
    "build": "full",
    "skinTone": "deep",
    "hairStyle": "short",
    "hairColor": "blonde",
    "heightCm": 181,
    "image": "assets/models/full-deep-short.svg"
  },
  {
    "id": "full-deep-none",
    "heightClass": "short",
    "build": "full",
    "skinTone": "deep",
    "hairStyle": "none",
    "hairColor": "gray",
    "heightCm": 156,
    "image": "assets/models/full-deep-none.svg"
  },
  {
    "id": "full-rich-deep-long",
    "heightClass": "average",
    "build": "full",
    "skinTone": "rich-deep",
    "hairStyle": "long",
    "hairColor": "brown",
    "heightCm": 168,
    "image": "assets/models/full-rich-deep-long.svg"
  },
  {
    "id": "full-rich-deep-bob",
    "heightClass": "tall",
    "build": "full",
    "skinTone": "rich-deep",
    "hairStyle": "bob",
    "hairColor": "blonde",
    "heightCm": 181,
    "image": "assets/models/full-rich-deep-bob.svg"
  },
  {
    "id": "full-rich-deep-short",
    "heightClass": "short",
    "build": "full",
    "skinTone": "rich-deep",
    "hairStyle": "short",
    "hairColor": "gray",
    "heightCm": 156,
    "image": "assets/models/full-rich-deep-short.svg"
  },
  {
    "id": "full-rich-deep-none",
    "heightClass": "average",
    "build": "full",
    "skinTone": "rich-deep",
    "hairStyle": "none",
    "hairColor": "black",
    "heightCm": 168,
    "image": "assets/models/full-rich-deep-none.svg"
  }
];
  root.FitCheckModels = models;
  if (typeof module !== "undefined") module.exports = models;
})(typeof globalThis !== "undefined" ? globalThis : this);
