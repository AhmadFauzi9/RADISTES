export const WALI_REPORT_SETTINGS_KEY = 'radistes_wali_report_settings';

const waliName = classInfo => classInfo?.wali?.trim().toLowerCase();

export function readWaliReportSettings(storage) {
  const value = storage.getItem(WALI_REPORT_SETTINGS_KEY);
  try {
    const settings = JSON.parse(value);
    return settings && typeof settings === 'object' && !Array.isArray(settings) ? settings : {};
  } catch {
    return {};
  }
}

export function getWaliReportSettings(settings, classInfo) {
  const owner = waliName(classInfo);
  const saved = settings[classInfo?.id];
  return owner && saved?.owner === owner ? saved : undefined;
}

export function storeWaliReportSettings(storage, classInfo, { nipy, signature }) {
  const settings = {
    ...readWaliReportSettings(storage),
    [classInfo.id]: { owner: waliName(classInfo), nipy: nipy.trim(), signature },
  };
  storage.setItem(WALI_REPORT_SETTINGS_KEY, JSON.stringify(settings));
  return settings;
}
