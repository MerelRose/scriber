-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Gegenereerd op: 28 apr 2025 om 12:19
-- Serverversie: 10.4.32-MariaDB
-- PHP-versie: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `transcription`
--

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `talen`
--

CREATE TABLE `talen` (
  `id` int(11) NOT NULL,
  `naam` varchar(255) NOT NULL,
  `afkorting` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Gegevens worden geëxporteerd voor tabel `talen`
--

INSERT INTO `talen` (`id`, `naam`, `afkorting`) VALUES
(1, 'AFAR', 'aa'),
(2, 'ABKHAZIAN', 'ab'),
(3, 'AFRIKAANS', 'af'),
(4, 'AKAN', 'ak'),
(5, 'AMHARIC', 'am'),
(6, 'ARAGONESE', 'an'),
(7, 'ARABIC', 'ar'),
(8, 'ASSAMESE', 'as'),
(9, 'AVAR', 'av'),
(10, 'AYMARA', 'ay'),
(11, 'AZERBAIJANI', 'az'),
(12, 'BASHKIR', 'ba'),
(13, 'BELARUSIAN', 'be'),
(14, 'BULGARIAN', 'bg'),
(15, 'BIHARI', 'bh'),
(16, 'BISLAMA', 'bi'),
(17, 'BAMBARA', 'bm'),
(18, 'BENGALI', 'bn'),
(19, 'TIBETAN', 'bo'),
(20, 'BRETON', 'br'),
(21, 'BOSNIAN', 'bs'),
(22, 'CATALAN', 'ca'),
(23, 'CHECHEN', 'ce'),
(24, 'CHAMORRO', 'ch'),
(25, 'CORSICAN', 'co'),
(26, 'CREE', 'cr'),
(27, 'CZECH', 'cs'),
(28, 'OLD_CHURCH_SLAVONIC', 'cu'),
(29, 'CHUVASH', 'cv'),
(30, 'WELSH', 'cy'),
(31, 'DANISH', 'da'),
(32, 'GERMAN', 'de'),
(33, 'DIVEHI', 'dv'),
(34, 'DZONGKHA', 'dz'),
(35, 'EWE', 'ee'),
(36, 'GREEK', 'el'),
(37, 'ENGLISH', 'en'),
(38, 'ESPERANTO', 'eo'),
(39, 'SPANISH', 'es'),
(40, 'ESTONIAN', 'et'),
(41, 'BASQUE', 'eu'),
(42, 'PERSIAN', 'fa'),
(43, 'PEUL', 'ff'),
(44, 'FINNISH', 'fi'),
(45, 'FIJIAN', 'fj'),
(46, 'FAROESE', 'fo'),
(47, 'FRENCH', 'fr'),
(48, 'WEST_FRISIAN', 'fy'),
(49, 'IRISH', 'ga'),
(50, 'SCOTTISH_GAELIC', 'gd'),
(51, 'GALICIAN', 'gl'),
(52, 'GUARANI', 'gn'),
(53, 'GUJARATI', 'gu'),
(54, 'MANX', 'gv'),
(55, 'HAUSA', 'ha'),
(56, 'HEBREW', 'he'),
(57, 'HINDI', 'hi'),
(58, 'HIRI_MOTU', 'ho'),
(59, 'CROATIAN', 'hr'),
(60, 'HAITIAN', 'ht'),
(61, 'HUNGARIAN', 'hu'),
(62, 'ARMENIAN', 'hy'),
(63, 'HERERO', 'hz'),
(64, 'INTERLINGUA', 'ia'),
(65, 'INDONESIAN', 'id'),
(66, 'INTERLINGUE', 'ie'),
(67, 'IGBO', 'ig'),
(68, 'SICHUAN_YI', 'ii'),
(69, 'INUPIAK', 'ik'),
(70, 'IDO', 'io'),
(71, 'ICELANDIC', 'is'),
(72, 'ITALIAN', 'it'),
(73, 'INUKTITUT', 'iu'),
(74, 'JAPANESE', 'ja'),
(75, 'JAVANESE', 'jv'),
(76, 'GEORGIAN', 'ka'),
(77, 'KONGO', 'kg'),
(78, 'KIKUYU', 'ki'),
(79, 'KUANYAMA', 'kj'),
(80, 'KAZAKH', 'kk'),
(81, 'GREENLANDIC', 'kl'),
(82, 'CAMBODIAN', 'km'),
(83, 'KANNADA', 'kn'),
(84, 'KOREAN', 'ko'),
(85, 'KANURI', 'kr'),
(86, 'KASHMIRI', 'ks'),
(87, 'KURDISH', 'ku'),
(88, 'KOMI', 'kv'),
(89, 'CORNISH', 'kw'),
(90, 'KIRGHIZ', 'ky'),
(91, 'LATIN', 'la'),
(92, 'LUXEMBOURGISH', 'lb'),
(93, 'GANDA', 'lg'),
(94, 'LIMBURGIAN', 'li'),
(95, 'LINGALA', 'ln'),
(96, 'LAOTIAN', 'lo'),
(97, 'LITHUANIAN', 'lt'),
(98, 'LATVIAN', 'lv'),
(99, 'MALAGASY', 'mg'),
(100, 'MARSHALLESE', 'mh'),
(101, 'MAORI', 'mi'),
(102, 'MACEDONIAN', 'mk'),
(103, 'MALAYALAM', 'ml'),
(104, 'MONGOLIAN', 'mn'),
(105, 'MOLDOVAN', 'mo'),
(106, 'MARATHI', 'mr'),
(107, 'MALAY', 'ms'),
(108, 'MALTESE', 'mt'),
(109, 'BURMESE', 'my'),
(110, 'NAURUAN', 'na'),
(111, 'NORTH_NDEBELE', 'nd'),
(112, 'NEPALI', 'ne'),
(113, 'NDONGA', 'ng'),
(114, 'DUTCH', 'nl'),
(115, 'NORWEGIAN_NYNORSK', 'nn'),
(116, 'NORWEGIAN', 'no'),
(117, 'SOUTH_NDEBELE', 'nr'),
(118, 'NAVAJO', 'nv'),
(119, 'CHICHEWA', 'ny'),
(120, 'OCCITAN', 'oc'),
(121, 'OJIBWA', 'oj'),
(122, 'OROMO', 'om'),
(123, 'ORIYA', 'or'),
(124, 'OSSETIAN', 'os'),
(125, 'PUNJABI', 'pa'),
(126, 'PALI', 'pi'),
(127, 'POLISH', 'pl'),
(128, 'PASHTO', 'ps'),
(129, 'PORTUGUESE', 'pt'),
(130, 'QUECHUA', 'qu'),
(131, 'RAETO_ROMANCE', 'rm'),
(132, 'KIRUNDI', 'rn'),
(133, 'ROMANIAN', 'ro'),
(134, 'RUSSIAN', 'ru'),
(135, 'RWANDI', 'rw'),
(136, 'SANSKRIT', 'sa'),
(137, 'SARDINIAN', 'sc'),
(138, 'SINDHI', 'sd'),
(139, 'SANGO', 'sg'),
(140, 'SERBO_CROATIAN', 'sh'),
(141, 'SINHALESE', 'si'),
(142, 'SLOVAK', 'sk'),
(143, 'SLOVENIAN', 'sl'),
(144, 'SAMOAN', 'sm'),
(145, 'SHONA', 'sn'),
(146, 'SOMALIA', 'so'),
(147, 'ALBANIAN', 'sq'),
(148, 'SERBIAN', 'sr'),
(149, 'SWATI', 'ss'),
(150, 'SOUTHERN_SOTHO', 'st'),
(151, 'SUNDANESE', 'su'),
(152, 'SWEDISH', 'sv'),
(153, 'SWAHILI', 'sw'),
(154, 'TAMIL', 'ta'),
(155, 'TELUGU', 'te'),
(156, 'TAJIK', 'tg'),
(157, 'THAI', 'th'),
(158, 'TIGRINYA', 'ti'),
(159, 'TURKMEN', 'tk'),
(160, 'TAGALOG', 'tl'),
(161, 'TSWANA', 'tn'),
(162, 'TONGA', 'to'),
(163, 'TURKISH', 'tr'),
(164, 'TSONGA', 'ts'),
(165, 'TATAR', 'tt'),
(166, 'TWI', 'tw'),
(167, 'TAHITIAN', 'ty'),
(168, 'UYGHUR', 'ug'),
(169, 'UKRAINIAN', 'uk'),
(170, 'URDU', 'ur'),
(171, 'VENDA', 've'),
(172, 'VIETNAMESE', 'vi'),
(173, 'VOLAPÜK', 'vo'),
(174, 'WALLOON', 'wa'),
(175, 'WOLOF', 'wo'),
(176, 'XHOSA', 'xh'),
(177, 'YIDDISH', 'yi'),
(178, 'YORUBA', 'yo'),
(179, 'ZHUANG', 'za'),
(180, 'CHINESE', 'zh'),
(181, 'ZULU', 'zu');

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `transcribe`
--

CREATE TABLE `transcribe` (
  `id` int(11) NOT NULL,
  `tekst` varchar(999) NOT NULL,
  `video_id` int(30) NOT NULL,
  `time_stamp_start` varchar(30) NOT NULL,
  `taal` varchar(4) NOT NULL,
  `created_at` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `video`
--

CREATE TABLE `video` (
  `id` int(11) NOT NULL,
  `naam` varchar(255) NOT NULL,
  `file_name` varchar(500) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexen voor geëxporteerde tabellen
--

--
-- Indexen voor tabel `talen`
--
ALTER TABLE `talen`
  ADD PRIMARY KEY (`id`);

--
-- Indexen voor tabel `transcribe`
--
ALTER TABLE `transcribe`
  ADD PRIMARY KEY (`id`) USING BTREE;

--
-- Indexen voor tabel `video`
--
ALTER TABLE `video`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT voor geëxporteerde tabellen
--

--
-- AUTO_INCREMENT voor een tabel `talen`
--
ALTER TABLE `talen`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=182;

--
-- AUTO_INCREMENT voor een tabel `transcribe`
--
ALTER TABLE `transcribe`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `video`
--
ALTER TABLE `video`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
