//! services/avatar/dicebear.js

import { randomUUID } from 'node:crypto';
import { createAvatar } from '@dicebear/core';
import {
	adventurer,
	adventurerNeutral,
	avataaars,
	avataaarsNeutral,
	bigEars,
	bigEarsNeutral,
	bigSmile,
	bottts,
	botttsNeutral,
	croodles,
	croodlesNeutral,
	dylan,
	funEmoji,
	glass,
	icons,
	identicon,
	lorelei,
	loreleiNeutral,
	micah,
	miniavs,
	notionists,
	notionistsNeutral,
	openPeeps,
	personas,
	pixelArt,
	pixelArtNeutral,
	rings,
	shapes,
	thumbs,
	toonHead,
} from '@dicebear/collection';

export const AVATAR_STYLES = [
	{ key: 'adventurer', label: 'Adventurer', collection: adventurer },
	{
		key: 'adventurer-neutral',
		label: 'Adventurer Neutral',
		collection: adventurerNeutral,
	},
	{ key: 'avataaars', label: 'Avataaars', collection: avataaars },
	{
		key: 'avataaars-neutral',
		label: 'Avataaars Neutral',
		collection: avataaarsNeutral,
	},
	{ key: 'big-ears', label: 'Big Ears', collection: bigEars },
	{
		key: 'big-ears-neutral',
		label: 'Big Ears Neutral',
		collection: bigEarsNeutral,
	},
	{ key: 'big-smile', label: 'Big Smile', collection: bigSmile },
	{ key: 'bottts', label: 'Bottts', collection: bottts },
	{
		key: 'bottts-neutral',
		label: 'Bottts Neutral',
		collection: botttsNeutral,
	},
	{ key: 'croodles', label: 'Croodles', collection: croodles },
	{
		key: 'croodles-neutral',
		label: 'Croodles Neutral',
		collection: croodlesNeutral,
	},
	{ key: 'dylan', label: 'Dylan', collection: dylan },
	{ key: 'fun-emoji', label: 'Fun Emoji', collection: funEmoji },
	{ key: 'glass', label: 'Glass', collection: glass },
	{ key: 'icons', label: 'Icons', collection: icons },
	{ key: 'identicon', label: 'Identicon', collection: identicon },
	{ key: 'lorelei', label: 'Lorelei', collection: lorelei },
	{
		key: 'lorelei-neutral',
		label: 'Lorelei Neutral',
		collection: loreleiNeutral,
	},
	{ key: 'micah', label: 'Micah', collection: micah },
	{ key: 'miniavs', label: 'Miniavs', collection: miniavs },
	{ key: 'notionists', label: 'Notionists', collection: notionists },
	{
		key: 'notionists-neutral',
		label: 'Notionists Neutral',
		collection: notionistsNeutral,
	},
	{ key: 'open-peeps', label: 'Open Peeps', collection: openPeeps },
	{ key: 'personas', label: 'Personas', collection: personas },
	{ key: 'pixel-art', label: 'Pixel Art', collection: pixelArt },
	{
		key: 'pixel-art-neutral',
		label: 'Pixel Art Neutral',
		collection: pixelArtNeutral,
	},
	{ key: 'rings', label: 'Rings', collection: rings },
	{ key: 'shapes', label: 'Shapes', collection: shapes },
	{ key: 'thumbs', label: 'Thumbs', collection: thumbs },
	{ key: 'toon-head', label: 'Toon Head', collection: toonHead },
];

const DEFAULT_AVATAR_STYLE = 'adventurer';
const DEFAULT_AVATAR_BACKGROUND = 'f7c59f';
const AVATAR_STYLE_MAP = new Map(
	AVATAR_STYLES.map((style) => [style.key, style]),
);

function svgToDataUri(svg) {
	return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function parseAvatarValue(value) {
	const avatarValue = typeof value === 'string' ? value.trim() : '';
	const parts = avatarValue.split(':');
	const [styleKey, seed, background] =
		parts.length >= 2
			? parts
			: [DEFAULT_AVATAR_STYLE, avatarValue, DEFAULT_AVATAR_BACKGROUND];

	const style =
		AVATAR_STYLE_MAP.get(styleKey) ||
		AVATAR_STYLE_MAP.get(DEFAULT_AVATAR_STYLE);

	return {
		styleKey: style.key,
		seed: seed || createAvatarSeed(),
		background: normalizeAvatarBackground(background),
		style,
	};
}

function createAvatarDataUri({ style, seed }) {
	const avatar = createAvatar(style.collection, {
		seed,
		radius: 50,
	});

	return svgToDataUri(avatar.toString());
}

export function createUserAvatarDataUri(value) {
	return createAvatarDataUri(parseAvatarValue(value));
}

export function createAvatarSeed() {
	return randomUUID().slice(0, 8);
}

export function normalizeAvatarBackground(background) {
	const value = typeof background === 'string' ? background.trim() : '';
	const normalized = value.replace(/^#/, '').toLowerCase();

	return /^[a-f0-9]{6}$/i.test(normalized)
		? normalized
		: DEFAULT_AVATAR_BACKGROUND;
}

export function createAvatarValue(
	styleKey,
	seed,
	background = DEFAULT_AVATAR_BACKGROUND,
) {
	const style = AVATAR_STYLE_MAP.has(styleKey)
		? styleKey
		: DEFAULT_AVATAR_STYLE;
	const avatarBackground = normalizeAvatarBackground(background);

	return `${style}:${seed}:${avatarBackground}`;
}

export function getUserAvatarBackground(value) {
	return `#${parseAvatarValue(value).background}`;
}

export function isSupportedAvatarValue(value) {
	if (!value) return true;
	if (typeof value !== 'string') return false;

	const parts = value.split(':');
	const [styleKey, seed, background] =
		parts.length >= 2
			? parts
			: [DEFAULT_AVATAR_STYLE, value, DEFAULT_AVATAR_BACKGROUND];
	const hasValidBackground =
		background === undefined || /^[a-f0-9]{6}$/i.test(background);

	return (
		AVATAR_STYLE_MAP.has(styleKey) &&
		/^[a-z0-9-]{1,64}$/i.test(seed) &&
		hasValidBackground
	);
}

export function createAvatarStyleOption(styleKey, optionsPerStyle = 24) {
	const style = AVATAR_STYLE_MAP.get(styleKey);

	if (!style) {
		return null;
	}

	const options = Array.from({ length: optionsPerStyle }, () => {
		const seed = createAvatarSeed();

		return {
			seed,
			value: createAvatarValue(style.key, seed),
			background: `#${DEFAULT_AVATAR_BACKGROUND}`,
			src: createAvatarDataUri({ style, seed }),
		};
	});

	return {
		key: style.key,
		label: style.label,
		preview: options[0]?.src || '',
		options,
	};
}

export function createAvatarStyleOptions(optionsPerStyle = 12) {
	return AVATAR_STYLES.map((style) =>
		createAvatarStyleOption(style.key, optionsPerStyle),
	);
}
