/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { BaseControl, PanelBody, ResizableBox } from '@wordpress/components';
import { compose, withInstanceId } from '@wordpress/compose';
import { withDispatch } from '@wordpress/data';

const SpacerEdit = ( { attributes, isSelected, setAttributes, instanceId, onResizeStart, onResizeStop } ) => {
	const { height } = attributes;
	const id = `block-spacer-height-input-${ instanceId }`;
	const [ inputHeightValue, setInputHeightValue ] = useState( height );

	return (
		<>
			<ResizableBox
				className={ classnames(
					'block-library-spacer__resize-container',
					{ 'is-selected': isSelected },
				) }
				size={ {
					height,
				} }
				minHeight="20"
				enable={ {
					top: false,
					right: false,
					bottom: true,
					left: false,
					topRight: false,
					bottomRight: false,
					bottomLeft: false,
					topLeft: false,
				} }
				onResizeStart={ onResizeStart }
				onResizeStop={ ( event, direction, elt, delta ) => {
					onResizeStop();
					const spacerHeight = parseInt( height + delta.height, 10 );
					setAttributes( {
						height: spacerHeight,
					} );
					setInputHeightValue( spacerHeight );
				} }
			/>
			<InspectorControls>
				<PanelBody title={ __( 'Spacer settings' ) }>
					<BaseControl label={ __( 'Height in pixels' ) } id={ id }>
						<input
							type="number"
							id={ id }
							onChange={ ( event ) => {
								let spacerHeight = parseInt( event.target.value, 10 );
								setInputHeightValue( spacerHeight );
								if ( isNaN( spacerHeight ) ) {
									// Set spacer height to default size and input box to empty string
									setInputHeightValue( '' );
									spacerHeight = 100;
								} else if ( spacerHeight < 20 ) {
									// Set spacer height to minimum size
									spacerHeight = 20;
								}
								setAttributes( {
									height: spacerHeight,
								} );
							} }
							value={ inputHeightValue }
							min="20"
							step="10"
						/>
					</BaseControl>
				</PanelBody>
			</InspectorControls>
		</>
	);
};

export default compose( [
	withDispatch( ( dispatch ) => {
		const { toggleSelection } = dispatch( 'core/block-editor' );

		return {
			onResizeStart: () => toggleSelection( false ),
			onResizeStop: () => toggleSelection( true ),
		};
	} ),
	withInstanceId,
] )( SpacerEdit );
