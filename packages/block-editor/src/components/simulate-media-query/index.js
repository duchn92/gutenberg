/**
 * External dependencies
 */
import {
	filter,
	get,
	some,
} from 'lodash';
import { match } from 'css-mediaquery';

/**
 * WordPress dependencies
 */
import { useEffect } from '@wordpress/element';

const ENABLED_MEDIA_QUERY = '(min-width:0px)';
const DISABLED_MEDIA_QUERY = '(min-width:999999px)';

const VALID_MEDIA_QUERY_REGEX = /\((min|max)-width:([^\(]*?)px\)/g;

function getStyleSheetsThatMatchPaths( partialPaths ) {
	return filter(
		get( window, [ 'document', 'styleSheets' ], [] ),
		( styleSheet ) => {
			return (
				styleSheet.href &&
				some(
					partialPaths,
					( partialPath ) => {
						return styleSheet.href.includes( partialPath );
					}
				)
			);
		}
	);
}

function isReplaceableMediaRule( rule ) {
	if ( ! rule.media ) {
		return false;
	}
	return !! rule.conditionText.match( VALID_MEDIA_QUERY_REGEX );
}

function replaceRule( styleSheet, newRuleText, index ) {
	styleSheet.removeRule( index );
	styleSheet.insertRule( newRuleText, index );
}

function replaceMediaQueryWithWidthEvaluation( ruleText, widthValue ) {
	return ruleText.replace( VALID_MEDIA_QUERY_REGEX, ( matchedSubstring ) => {
		if (
			match(
				matchedSubstring,
				{
					type: 'screen',
					width: widthValue,
				}
			)
		) {
			return ENABLED_MEDIA_QUERY;
		}
		return DISABLED_MEDIA_QUERY;
	} );
}

export default function useSimulatedMediaQuery( partialPaths, width ) {
	useEffect(
		() => {
			const styleSheets = getStyleSheetsThatMatchPaths( partialPaths );
			const originalStyles = [];
			styleSheets.forEach( ( styleSheet, styleSheetIndex ) => {
				for ( let ruleIndex = 0; ruleIndex < styleSheet.cssRules.length; ++ruleIndex ) {
					const rule = styleSheet.cssRules[ ruleIndex ];
					if ( ! isReplaceableMediaRule( rule ) ) {
						continue;
					}
					const ruleText = rule.cssText;
					if ( ! originalStyles[ styleSheetIndex ] ) {
						originalStyles[ styleSheetIndex ] = [];
					}
					originalStyles[ styleSheetIndex ][ ruleIndex ] = ruleText;
					replaceRule(
						styleSheet,
						replaceMediaQueryWithWidthEvaluation( ruleText, width ),
						ruleIndex
					);
				}
			} );
			return () => {
				originalStyles.forEach( ( rulesCollection, styleSheetIndex ) => {
					if ( ! rulesCollection ) {
						return;
					}
					for ( let ruleIndex = 0; ruleIndex < rulesCollection.length; ++ruleIndex ) {
						const originalRuleText = rulesCollection[ ruleIndex ];
						if ( originalRuleText ) {
							replaceRule( styleSheets[ styleSheetIndex ], originalRuleText, ruleIndex );
						}
					}
				} );
			};
		},
		[ partialPaths, width ]
	);
	return null;
}

