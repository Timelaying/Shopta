export const VEHICLE_STOP_LIMITS = {
  small: 5,
  standard: 10,
  large: 15,
} as const;

export type VehicleSize = keyof typeof VEHICLE_STOP_LIMITS;

export const VEHICLE_SIZES: VehicleSize[] = Object.keys(
  VEHICLE_STOP_LIMITS
) as VehicleSize[];

export const MIN_STOPS_PER_TRIP = 1;

export const getMaxStopsForVehicle = (vehicleSize: VehicleSize): number =>
  VEHICLE_STOP_LIMITS[vehicleSize];

export const isVehicleSize = (value: unknown): value is VehicleSize =>
  typeof value === 'string' &&
  Object.prototype.hasOwnProperty.call(VEHICLE_STOP_LIMITS, value);

export const isValidStopCountForVehicle = (
  stopCount: number,
  vehicleSize: VehicleSize
): boolean => {
  if (!Number.isInteger(stopCount)) {
    return false;
  }
  const maxStops = getMaxStopsForVehicle(vehicleSize);
  return stopCount >= MIN_STOPS_PER_TRIP && stopCount <= maxStops;
};
