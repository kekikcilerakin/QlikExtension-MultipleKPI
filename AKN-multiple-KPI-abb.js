define([
	'jquery',
	'qlik',
	'./properties/properties',
	'./properties/initialProperties',
	'//cdn.jsdelivr.net/npm/numbro@2.2.0/dist/numbro.min.js',
	'//cdn.jsdelivr.net/npm/numbro@2.2.0/dist/languages.min.js'

], function ($, qlik, props, initProps, numbro) {
	$('<link rel="stylesheet" type="text/css" href="AKN-multiple-KPI-abb.css">');
	'use strict';
	return {
		definition: props,
		initialProperties: initProps,

		paint: async function ($element, layout) {
			var app = qlik.currApp();

			let isTopMeasureNumber = false;

			function registerLanguage()
{

			}
			//#region numbro value formatting
			numbro.registerLanguage({
				languageTag: "az",
				delimiters: {
					thousands: ",",
					decimal: "."
				},
				abbreviations: {
					thousand: "K",
					million: "M",
					billion: "G",
					trillion: "T"
				},
				ordinal: number => {
					let b = number % 10;
					return (~~(number % 100 / 10) === 1) ? "th" : (b === 1) ? "st" : (b === 2) ? "nd" : (b === 3) ? "rd" : "th";
				},
				currency: {
					symbol: "₼",
					position: "postfix",
					code: "AZN"
				},
				currencyFormat: {
					thousandSeparated: true,
					totalLength: 4,
					spaceSeparated: false,
					spaceSeparatedCurrency: false,
					average: true
				},
				formats: {
					fourDigits: {
						totalLength: 4,
						spaceSeparated: false,
						average: true
					},
					fullWithTwoDecimals: {
						output: "currency",
						thousandSeparated: true,
						spaceSeparated: false,
						mantissa: 2
					},
					fullWithTwoDecimalsNoCurrency: {
						mantissa: 2,
						thousandSeparated: true
					},
					fullWithNoDecimals: {
						output: "currency",
						thousandSeparated: true,
						spaceSeparated: false,
						mantissa: 0
					}
				}
			});

			numbro.setLanguage('az');

			function formatMeasureValue(measure, value) {
				if (measure.qIsAutoFormat) {
					return numbro(value).format('0.0a');
				}
				else {
					return numbro(value).format(measure.qNumFormat.qFmt);
				}
			}
			//#endregion

			//#region qMatrix
			function getqMatrix() {
				return layout.qHyperCube.qDataPages[0].qMatrix;
			}
			//console.log("getMatrix", getqMatrix())
			//#endregion

			//#region measures
			const measures = layout.qHyperCube.qMeasureInfo;
			let topMeasureValue;
			let bottomMeasureValue;
			if (getqMatrix()[0][0].qNum !== 'NaN')
			{
				isTopMeasureNumber = true;
				
				const topMeasure = measures[0];
				topMeasureValue = formatMeasureValue(topMeasure, topMeasure.qMax);
				
				if (measures.length === 2) {
					const bottomMeasure = measures[1];
					bottomMeasureValue = formatMeasureValue(bottomMeasure, bottomMeasure.qMax);
				}
			}
			else
			{
				topMeasureValue = getqMatrix()[0][0].qText;

				if (measures.length === 2) {
					const bottomMeasure = measures[1];
					bottomMeasureValue = formatMeasureValue(bottomMeasure, bottomMeasure.qMax);
				}
			}
			//#endregion

			//#region icon
			let positiveIconClass = "bi-arrow-up-circle-fill";
			let positiveIconColor = "#45d286";
			let negativeIconClass = "bi-arrow-down-circle-fill";
			let negativeIconColor = "#e57e7e";

			let iconClass;
			let iconColor;

			if (isTopMeasureNumber)
			{
				const floatValue = parseFloat(topMeasureValue);
				if (floatValue > 0) {
					iconClass = positiveIconClass;
					iconColor = positiveIconColor;
				}
				else if (floatValue < 0) {
					iconClass = negativeIconClass;
					iconColor = negativeIconColor;
				}
				else {
					iconClass = "";
					iconColor = "";
				}
			}
			
			//#endregion
			
			//#region canvas
			const canvasID = layout.qInfo.qId;
			const width = $element.width();
			const height = $element.height();
			
			let html;
			html += `<head><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"></head>`
			
			if (measures.length === 2) {
				html += `<div id="${canvasID}" style="width: ${width}px; height: ${height}px; background: #42A0F2; border-radius: 10px; text-align: center; position: absolute; top: 0; display: flex; flex-direction: column; justify-content: space-around; align-items: center;">`;
				
				if (layout.toggleIcon) {
					html += `<i class="${iconClass}" style="font-size: 2rem; color: ${iconColor};"></i>`;
				}
				
				html += `<div class="header" style="color: #C5E1FA; font-size: 15px;">${layout.qHyperCube.qMeasureInfo[0].qFallbackTitle}</div>`;
				html += `<div class="measure" style="color: #FFFFFF; font-size: 30px;">${topMeasureValue}</div>`;
				html += `<hr class="dotted-line" style="border: none; border-top: 2px dotted #C5E1FA; width: 70%; margin: 0">`;
				html += `<div class="test-text" style="color: #FFFFFF; font-size: 12px; background: #3085cf; padding: 5px; width: 70%; text-align: center; border-radius: 10px;"> ${layout.qHyperCube.qMeasureInfo[1].qFallbackTitle} - ${bottomMeasureValue}</div>`;
			}
			else {
				html += `<div id="${canvasID}" style="width: ${width}px; height: ${height}px; background: #42A0F2; border-radius: 10px; text-align: center; position: absolute; top: 0; display: flex; flex-direction: column; justify-content: center; align-items: center;">`;
				
				if (layout.toggleIcon) {
					html += `<i class="${iconClass}" style="font-size: 2rem; color: ${iconColor};"></i>`;
				}
				
				html += `<div class="header" style="color: #C5E1FA; font-size: 15px; margin-top: 10px;">${layout.qHyperCube.qMeasureInfo[0].qFallbackTitle}</div>`;
				html += `<div class="measure" style="color: #FFFFFF; font-size: 30px;">${topMeasureValue}</div>`;
			}
			
			html += `</div>`;
			
			$element.html(html);
			//#endregion
			
			//#region Hover Popup
			if (layout.popupText)
			{
				const measureElement = document.querySelector(`#${canvasID} .measure`);
				
				const popup = document.createElement('div');
				popup.className = 'popup';
				popup.textContent = layout.popupText;
				
				document.body.appendChild(popup);

				measureElement.addEventListener('mouseover', (event) => {
					const measureRect = measureElement.getBoundingClientRect();

					const centerX = (measureRect.left + measureRect.width / 2) + 16;
					const centerY = (measureRect.top + measureRect.height / 2) + 16;

					popup.style.left = centerX + 'px';
					popup.style.top = centerY + 'px';
					popup.style.display = 'block';

					popup.style.position = 'absolute';
					popup.style.background = 'rgba(0, 0, 0, 0.7)';
					popup.style.color = 'white';
					popup.style.fontSize = '20px';
					popup.style.padding = '10px';
					popup.style.borderRadius = '10px';
					popup.style.textAlign = 'center';
					popup.style.zIndex = '999';
					popup.style.maxWidth = '512px';
				});
					
				measureElement.addEventListener('mouseout', () => {
					popup.style.display = 'none';
				});
			}
			//#endregion
		}
	};
});