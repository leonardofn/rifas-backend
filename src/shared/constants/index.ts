export abstract class AppConstants {
  // Contantes numéricas
  static readonly ZERO = 0;
  static readonly ONE = 1;
  static readonly TWO = 2;
  static readonly THREE = 3;
  static readonly FOUR = 4;
  static readonly SIX = 6;
  static readonly TEN = 10;
  static readonly TWELVE = 12;
  static readonly FIFTY = 50;
  static readonly ONE_HUNDRED = 100;

  static readonly PROCESS_EXIT_FAILURE_CODE = 1;

  static readonly DEFAULT_SERVER_PORT = 3000;
  static readonly DEFAULT_DB_PORT = 5432;

  static readonly JWT_ACCESS_TOKEN_TTL_SECONDS = 900;
  static readonly JWT_REFRESH_TOKEN_TTL_SECONDS = 604800;
  static readonly PASSWORD_RESET_TOKEN_TTL_SECONDS = 900;
  static readonly PASSWORD_RESET_TOKEN_BYTE_LENGTH = 32;
  static readonly MILLISECONDS_IN_SECOND = 1000;
  static readonly SECONDS_IN_DAY = 86400;
  static readonly SECONDS_IN_YEAR = 31536000;

  static readonly DEFAULT_PAGE = 1;
  static readonly DEFAULT_LIMIT = 12;
  static readonly DEFAULT_USERS_LIMIT = 10;
  static readonly TRENDING_MAX_LIMIT = 50;
  static readonly PAGINATION_MAX_LIMIT = 100;

  static readonly MIN_PASSWORD_LENGTH = 6;
  static readonly BCRYPT_SALT_ROUNDS = 12;
  static readonly MAX_PRIZES_PER_RAFFLE = 3;

  static readonly VARCHAR_MEDIUM_LENGTH = 50;
  static readonly VARCHAR_LARGE_LENGTH = 100;
  static readonly VARCHAR_DEFAULT_LENGTH = 255;
  static readonly VARCHAR_URL_LENGTH = 1024;
  static readonly PUBLIC_ID_LENGTH = 16;
  static readonly PUBLIC_ID_NUMERIC_PART_LENGTH = 12;

  static readonly NUMERIC_PRECISION_MONEY = 10;
  static readonly NUMERIC_SCALE_MONEY = 2;

  static readonly TRENDING_TOTAL_COLLECTED_NORMALIZER = 10000;
  static readonly TRENDING_SOLD_RATIO_WEIGHT = 0.6;
  static readonly TRENDING_TOTAL_COLLECTED_WEIGHT = 0.25;
  static readonly TRENDING_DRAW_DATE_WEIGHT = 0.15;

  static readonly DECIMAL_RADIX = 10;
}
